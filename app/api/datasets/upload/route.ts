/**
 * DATASET FILE UPLOAD ENDPOINT
 * 
 * POST - OBJETIVO:
 * Permitir al usuario subir archivos CSV/JSON para crear un dataset histórico.
 * 
 * MISIÓN:
 * - Validar currentDatasetsUsage < monthlyDatasetsLimit
 * - Recibir FormData con:
 *   · file (CSV o JSON)
 *   · name (nombre del dataset)
 *   · description (opcional)
 * - Validar tamaño de archivo (max 50MB FREE, 500MB PRO)
 * - Parsear archivo:
 *   · CSV: usar PapaParse con {dynamicTyping: true, skipEmptyLines: true}
 *   · JSON: validar estructura [{x, y, z, value, ...}, ...]
 * - Detectar columnas automáticamente:
 *   · x, y, z (coordenadas) - OBLIGATORIO
 *   · value (valor del sensor) - OBLIGATORIO
 *   · timestamp, sensorId, sensorType (opcional)
 * - Crear Dataset con source="csv_upload" o "json_upload", status="processing"
 * - Insertar DataPoints en batch (chunked inserts de 1000 en 1000)
 * - Calcular boundingBox automáticamente (MIN/MAX de x,y,z)
 * - Actualizar Dataset.status = "active" cuando termine
 * - Incrementar User.currentDatasetsUsage += 1
 * - Crear ActivityLog: action="dataset.uploaded"
 * 
 * USADO POR:
 * - "Upload Dataset" modal en /datasets
 * - Drag & drop zone en dashboard vacío
 * 
 * EJEMPLO CSV ESPERADO:
 * x,y,z,value,sensorId,timestamp
 * 10.5,20.3,5.0,72.5,S-001,2025-10-08T10:00:00Z
 * 10.6,20.3,5.0,73.2,S-001,2025-10-08T10:01:00Z
 * 
 * PRISMA MODELS:
 * - User (currentDatasetsUsage, monthlyDatasetsLimit)
 * - Dataset (name, source, status, boundingBox, totalDataPoints)
 * - DataPoint (bulk insert)
 * - ActivityLog
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';

/**
 * DATASET FILE UPLOAD ENDPOINT
 * 
 * POST - Upload CSV/JSON file to create a historical dataset
 */

const MAX_FILE_SIZE_FREE = 50 * 1024 * 1024; // 50MB
const MAX_FILE_SIZE_PRO = 500 * 1024 * 1024; // 500MB
const BATCH_SIZE = 1000; // Insert data points in batches

interface ParsedDataPoint {
  x: number;
  y: number;
  z?: number;
  value: number;
  sensorId?: string;
  sensorType?: string;
  unit?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

// POST /api/datasets/upload - Upload file
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse FormData
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Dataset name is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const isCSV = fileType === 'text/csv' || fileName.endsWith('.csv');
    const isJSON = fileType === 'application/json' || fileName.endsWith('.json');

    if (!isCSV && !isJSON) {
      return NextResponse.json(
        { error: 'Only CSV and JSON files are supported' },
        { status: 400 }
      );
    }

    // Fetch user with limits and subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentDatasetsUsage: true,
        monthlyDatasetsLimit: true,
        subscription: {
          select: {
            status: true,
            planId: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check dataset limit
    if (user.monthlyDatasetsLimit !== -1 && 
        user.currentDatasetsUsage >= user.monthlyDatasetsLimit) {
      return NextResponse.json(
        { 
          error: 'Dataset limit reached',
          message: `You have reached your plan limit of ${user.monthlyDatasetsLimit} datasets. Upgrade to create more.`,
          currentUsage: user.currentDatasetsUsage,
          limit: user.monthlyDatasetsLimit
        },
        { status: 403 }
      );
    }

    // Check file size based on plan
    const isPro = user.subscription?.status === 'active';
    const maxFileSize = isPro ? MAX_FILE_SIZE_PRO : MAX_FILE_SIZE_FREE;

    if (file.size > maxFileSize) {
      const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
      return NextResponse.json(
        { 
          error: 'File too large',
          message: `File size exceeds ${maxSizeMB}MB limit for your plan. ${!isPro ? 'Upgrade to Pro for 500MB limit.' : ''}`,
          fileSize: file.size,
          maxSize: maxFileSize
        },
        { status: 413 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    // Parse file based on type
    let parsedData: ParsedDataPoint[];
    const source = isCSV ? 'csv_upload' : 'json_upload';

    if (isCSV) {
      parsedData = await parseCSV(fileContent);
    } else {
      parsedData = parseJSON(fileContent);
    }

    // Validate parsed data
    if (parsedData.length === 0) {
      return NextResponse.json(
        { error: 'No valid data found in file' },
        { status: 400 }
      );
    }

    // Validate required fields in first row
    const firstRow = parsedData[0];
    if (typeof firstRow.x !== 'number' || 
        typeof firstRow.y !== 'number' || 
        typeof firstRow.value !== 'number') {
      return NextResponse.json(
        { 
          error: 'Invalid data format',
          message: 'Required fields: x (number), y (number), value (number)'
        },
        { status: 400 }
      );
    }

    // Calculate bounding box
    const boundingBox = calculateBoundingBox(parsedData);

    // Create dataset with status="processing"
    const dataset = await prisma.dataset.create({
      data: {
        userId,
        name,
        description,
        source,
        status: 'processing',
        boundingBox,
        totalDataPoints: parsedData.length
      }
    });

    // Insert data points in batches (async, don't await)
    insertDataPointsInBatches(dataset.id, parsedData, userId)
      .catch(error => {
        console.error('Error inserting data points:', error);
        // Update dataset status to error
        prisma.dataset.update({
          where: { id: dataset.id },
          data: { status: 'error' }
        }).catch(console.error);
      });

    // Increment user usage and create activity log
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          currentDatasetsUsage: {
            increment: 1
          }
        }
      }),
      prisma.activityLog.create({
        data: {
          userId,
          action: 'dataset.uploaded',
          resource: 'Dataset',
          resourceId: dataset.id,
          metadata: {
            name,
            source,
            fileSize: file.size,
            dataPoints: parsedData.length,
            fileName: file.name
          }
        }
      })
    ]);

    return NextResponse.json({
      ...dataset,
      message: 'Dataset created successfully. Data points are being processed in the background.'
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading dataset:', error);
    return NextResponse.json(
      { error: 'Failed to upload dataset' },
      { status: 500 }
    );
  }
}

// Parse CSV file
async function parseCSV(content: string): Promise<ParsedDataPoint[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim().toLowerCase(),
      complete: (results: Papa.ParseResult<any>) => {
        try {
          const data = results.data.map((row: any) => {
            // Extract known fields
            const point: ParsedDataPoint = {
              x: parseFloat(row.x),
              y: parseFloat(row.y),
              z: row.z !== undefined ? parseFloat(row.z) : undefined,
              value: parseFloat(row.value),
              sensorId: row.sensorid || row.sensor_id,
              sensorType: row.sensortype || row.sensor_type,
              unit: row.unit,
              timestamp: row.timestamp
            };

            // Collect remaining fields as metadata
            const knownFields = ['x', 'y', 'z', 'value', 'sensorid', 'sensor_id', 
                                 'sensortype', 'sensor_type', 'unit', 'timestamp'];
            const metadata: Record<string, any> = {};
            
            for (const [key, value] of Object.entries(row)) {
              if (!knownFields.includes(key.toLowerCase()) && value !== null && value !== undefined) {
                metadata[key] = value;
              }
            }

            if (Object.keys(metadata).length > 0) {
              point.metadata = metadata;
            }

            return point;
          });

          resolve(data);
        } catch (error) {
          reject(error);
        }
      },
      error: (error: any) => {
        reject(error);
      }
    });
  });
}

// Parse JSON file
function parseJSON(content: string): ParsedDataPoint[] {
  try {
    const data = JSON.parse(content);

    if (!Array.isArray(data)) {
      throw new Error('JSON must be an array of objects');
    }

    return data.map((row: any) => {
      const point: ParsedDataPoint = {
        x: parseFloat(row.x),
        y: parseFloat(row.y),
        z: row.z !== undefined ? parseFloat(row.z) : undefined,
        value: parseFloat(row.value),
        sensorId: row.sensorId || row.sensor_id,
        sensorType: row.sensorType || row.sensor_type,
        unit: row.unit,
        timestamp: row.timestamp
      };

      // Collect remaining fields as metadata
      const knownFields = ['x', 'y', 'z', 'value', 'sensorId', 'sensor_id', 
                           'sensorType', 'sensor_type', 'unit', 'timestamp'];
      const metadata: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(row)) {
        if (!knownFields.includes(key) && value !== null && value !== undefined) {
          metadata[key] = value;
        }
      }

      if (Object.keys(metadata).length > 0) {
        point.metadata = metadata;
      }

      return point;
    });
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
}

// Calculate bounding box from data points
function calculateBoundingBox(data: ParsedDataPoint[]) {
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  for (const point of data) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
    
    if (point.z !== undefined) {
      minZ = Math.min(minZ, point.z);
      maxZ = Math.max(maxZ, point.z);
    }
  }

  return {
    min: { x: minX, y: minY, z: minZ !== Infinity ? minZ : 0 },
    max: { x: maxX, y: maxY, z: maxZ !== -Infinity ? maxZ : 0 }
  };
}

// Insert data points in batches (background job)
async function insertDataPointsInBatches(
  datasetId: string, 
  data: ParsedDataPoint[],
  userId: string
) {
  const totalBatches = Math.ceil(data.length / BATCH_SIZE);

  for (let i = 0; i < totalBatches; i++) {
    const batch = data.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
    
    const dataPointsToCreate = batch.map(point => ({
      datasetId,
      x: point.x,
      y: point.y,
      z: point.z,
      value: point.value,
      sensorId: point.sensorId,
      sensorType: point.sensorType,
      unit: point.unit,
      metadata: point.metadata,
      timestamp: point.timestamp ? new Date(point.timestamp) : new Date(),
      createdAt: new Date()
    }));

    await prisma.dataPoint.createMany({
      data: dataPointsToCreate,
      skipDuplicates: true
    });

    // Log progress
    console.log(`[Upload] Dataset ${datasetId}: Inserted batch ${i + 1}/${totalBatches}`);
  }

  // Update dataset status to active
  await prisma.dataset.update({
    where: { id: datasetId },
    data: { 
      status: 'active',
      lastDataReceived: new Date()
    }
  });

  console.log(`[Upload] Dataset ${datasetId}: Upload complete`);
}