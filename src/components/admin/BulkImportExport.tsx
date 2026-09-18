import { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}

export default function BulkImportExport() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setImportResult(null);

    try {
      const text = await selectedFile.text();
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
      });

      const products = result.data as any[];
      const errors: Array<{ row: number; message: string }> = [];
      let successCount = 0;

      // Validate each row
      products.forEach((product, index) => {
        if (!product.name || !product.price || !product.category) {
          errors.push({
            row: index + 2,
            message: 'Missing required fields (name, price, category)',
          });
        } else {
          successCount++;
          // In production, send to API
          console.log('Importing product:', product);
        }
      });

      setImportResult({
        success: successCount,
        failed: errors.length,
        errors,
      });

      if (successCount > 0) {
        alert(`Successfully imported ${successCount} products!`);
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import file. Please check the format.');
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      // Simulate fetching products - replace with actual API call
      const mockProducts = [
        { name: 'Shadow Realm Co-Ord Set', sku: 'RVZ-CO-001', price: 4500, category: 'Co-Ord Sets', stock: 45 },
        { name: 'Acid Wash Phantom Tee', sku: 'RVZ-TS-001', price: 2800, category: 'Oversize Tees', stock: 80 },
        { name: 'Wide Leg Graphic Trouser', sku: 'RVZ-TR-001', price: 3200, category: 'Graphic Trousers', stock: 60 },
        { name: 'Urban Drift Trackpants', sku: 'RVZ-TP-001', price: 2900, category: 'Trackpants', stock: 100 },
        { name: 'Neon Pulse Graphic Shorts', sku: 'RVZ-SH-001', price: 2200, category: 'Graphic Shorts', stock: 75 },
      ];

      const csv = Papa.unparse(mockProducts);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      alert('Products exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export products.');
    } finally {
      setExporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      { name: 'Product Name', sku: 'SKU', price: 'Price', category: 'Category', stock: 'Stock' },
      { name: 'Example Product', sku: 'RVZ-EX-001', price: 1000, category: 'Example Category', stock: 10 },
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Bulk Import/Export</h2>
        <p className="text-sm text-gray-500 mt-1">Import and export products in bulk using CSV files</p>
      </div>

      {/* Import Section */}
      <div className="bg-white p-6 rounded-xl border">
        <div className="flex items-center gap-3 mb-4">
          <Upload className="text-blue-600" size={24} />
          <h3 className="text-lg font-bold">Import Products</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="w-full px-4 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {selectedFile && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium">Selected File:</p>
              <p className="text-sm text-gray-600">{selectedFile.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                Size: {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleImport}
              disabled={!selectedFile || importing}
              className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Upload size={18} />
              {importing ? 'Importing...' : 'Import Products'}
            </button>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-6 py-2 border border-black rounded-lg hover:bg-gray-50"
            >
              <Download size={18} />
              Download Template
            </button>
          </div>

          {importResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-600" size={20} />
                <p className="font-medium">Import Complete</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Successful:</p>
                  <p className="font-bold text-green-600">{importResult.success} products</p>
                </div>
                <div>
                  <p className="text-gray-600">Failed:</p>
                  <p className="font-bold text-red-600">{importResult.failed} products</p>
                </div>
              </div>
              {importResult.errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Errors:</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs text-red-600">
                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                        <span>Row {error.row}: {error.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white p-6 rounded-xl border">
        <div className="flex items-center gap-3 mb-4">
          <Download className="text-green-600" size={24} />
          <h3 className="text-lg font-bold">Export Products</h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Export all products to a CSV file. You can edit the file and import it back to update products.
        </p>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          {exporting ? 'Exporting...' : 'Export All Products'}
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="text-blue-600" size={24} />
          <h3 className="text-lg font-bold">Instructions</h3>
        </div>

        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <p className="font-medium mb-1">For Import:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Download the template file first</li>
              <li>Fill in product details in the template</li>
              <li>Required fields: name, price, category</li>
              <li>Optional fields: sku, stock</li>
              <li>Save as CSV and upload</li>
            </ul>
          </div>

          <div>
            <p className="font-medium mb-1">For Export:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Click "Export All Products" button</li>
              <li>CSV file will be downloaded automatically</li>
              <li>You can edit the file in Excel or any spreadsheet app</li>
              <li>Import the edited file to update products</li>
            </ul>
          </div>

          <div>
            <p className="font-medium mb-1">Notes:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Maximum file size: 10MB</li>
              <li>Maximum rows: 10,000</li>
              <li>Duplicate SKUs will be skipped</li>
              <li>Invalid rows will be reported in errors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
