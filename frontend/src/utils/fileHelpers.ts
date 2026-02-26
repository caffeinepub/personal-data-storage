export const TWO_TB_BYTES = 1_099_511_627_776_000; // 1000 TB in bytes

export function formatBytes(bytes: number | bigint): string {
  const n = typeof bytes === 'bigint' ? Number(bytes) : bytes;
  if (n === 0) return '0 B';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n < 1024 * 1024 * 1024 * 1024) return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  return `${(n / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB`;
}

export function formatTimestamp(time: bigint): string {
  // ICP timestamps are in nanoseconds
  const ms = Number(time / BigInt(1_000_000));
  const date = new Date(ms);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStoragePercentage(usedBytes: number): number {
  return (usedBytes / TWO_TB_BYTES) * 100;
}

export function getFileIcon(mimeType: string): string {
  if (!mimeType) return '📄';
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎬';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType === 'application/pdf') return '📕';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || mimeType.includes('gzip')) return '🗜️';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📋';
  if (mimeType.startsWith('text/')) return '📃';
  if (mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('json') || mimeType.includes('xml')) return '💻';
  return '📄';
}

export function getFileTypeLabel(mimeType: string): string {
  if (!mimeType) return 'File';
  if (mimeType.startsWith('image/')) return mimeType.split('/')[1].toUpperCase();
  if (mimeType.startsWith('video/')) return mimeType.split('/')[1].toUpperCase();
  if (mimeType.startsWith('audio/')) return mimeType.split('/')[1].toUpperCase();
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType.includes('zip')) return 'ZIP';
  if (mimeType.includes('word')) return 'DOCX';
  if (mimeType.includes('excel')) return 'XLSX';
  const parts = mimeType.split('/');
  return parts[parts.length - 1].toUpperCase().slice(0, 6);
}

export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(e.target.result));
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}
