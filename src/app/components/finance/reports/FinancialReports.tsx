'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getFinancialKPIs } from '@/app/lib/finance/queries';

export default function FinancialReports() {
  const [selectedReport, setSelectedReport] = useState<'income' | 'balance' | 'cashflow' | 'tax' | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [basis, setBasis] = useState<'accrual' | 'cash'>('accrual');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const reports = [
    {
      id: 'income' as const,
      name: 'Income Statement',
      description: 'Profit & Loss (P&L) statement',
      icon: '📊',
      color: 'from-[#6E86FF]/20 to-[#6E86FF]/10 border-[#6E86FF]/30',
    },
    {
      id: 'balance' as const,
      name: 'Balance Sheet',
      description: 'Assets, Liabilities & Equity',
      icon: '⚖️',
      color: 'from-[#34D399]/20 to-[#34D399]/10 border-[#34D399]/30',
    },
    {
      id: 'cashflow' as const,
      name: 'Cash Flow Statement',
      description: 'Operating, Investing & Financing',
      icon: '💵',
      color: 'from-[#B279DB]/20 to-[#B279DB]/10 border-[#B279DB]/30',
    },
    {
      id: 'tax' as const,
      name: 'Tax Reports',
      description: '1099-NEC, Deductions, Mileage',
      icon: '📋',
      color: 'from-[#FF6BBA]/20 to-[#FF6BBA]/10 border-[#FF6BBA]/30',
    },
  ];

  useEffect(() => {
    if (selectedReport) {
      loadReportData();
    }
  }, [selectedReport, dateRange, basis]);

  async function loadReportData() {
    setLoading(true);
    try {
      const data = await getFinancialKPIs(dateRange.start, dateRange.end);
      setReportData(data);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  }

  const downloadPDF = () => {
    if (!reportData) return;

    // Create PDF content
    const content = generatePDFContent();
    
    // Create a print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${selectedReport === 'income' ? 'Income Statement' : 'Balance Sheet'}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
              }
              h1 {
                text-align: center;
                color: #1f2937;
                margin-bottom: 10px;
              }
              .subtitle {
                text-align: center;
                color: #6b7280;
                margin-bottom: 30px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #e5e7eb;
              }
              th {
                background-color: #f3f4f6;
                font-weight: 600;
              }
              .total-row {
                background-color: #f9fafb;
                font-weight: bold;
              }
              .section-header {
                background-color: #1f2937;
                color: white;
                font-weight: bold;
                padding: 12px;
                margin-top: 20px;
              }
              .indent {
                padding-left: 30px;
              }
              .amount {
                text-align: right;
              }
              .grand-total {
                background-color: #3b82f6;
                color: white;
                font-size: 1.1em;
              }
              @media print {
                body { padding: 20px; }
              }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `);
      printWindow.document.close();
      
      // Auto-print
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const generatePDFContent = () => {
    if (selectedReport === 'income') {
      return `
        <h1>Income Statement</h1>
        <div class="subtitle">
          For the Period: ${new Date(dateRange.start).toLocaleDateString()} to ${new Date(dateRange.end).toLocaleDateString()}<br>
          (${basis.charAt(0).toUpperCase() + basis.slice(1)} Basis)
        </div>

        <div class="section-header">REVENUE</div>
        <table>
          <tr>
            <td class="indent">Total Revenue</td>
            <td class="amount">$${reportData?.total_revenue?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</td>
          </tr>
        </table>

        <div class="section-header">EXPENSES</div>
        <table>
          <tr>
            <td class="indent">Total Expenses</td>
            <td class="amount">$${reportData?.total_expenses?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</td>
          </tr>
        </table>

        <table>
          <tr class="grand-total">
            <td>NET INCOME</td>
            <td class="amount">$${reportData?.net_profit?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</td>
          </tr>
          <tr>
            <td>Net Profit Margin</td>
            <td class="amount">${reportData?.profit_margin?.toFixed(1) || '0.0'}%</td>
          </tr>
        </table>
      `;
    } else if (selectedReport === 'balance') {
      return `
        <h1>Balance Sheet</h1>
        <div class="subtitle">As of: ${new Date(dateRange.end).toLocaleDateString()}</div>

        <div class="section-header">ASSETS</div>
        <table>
          <tr class="total-row">
            <td>Total Assets</td>
            <td class="amount">$0.00</td>
          </tr>
        </table>

        <div class="section-header">LIABILITIES</div>
        <table>
          <tr class="total-row">
            <td>Total Liabilities</td>
            <td class="amount">$0.00</td>
          </tr>
        </table>

        <div class="section-header">EQUITY</div>
        <table>
          <tr class="total-row">
            <td>Total Equity</td>
            <td class="amount">$0.00</td>
          </tr>
        </table>

        <table>
          <tr class="grand-total">
            <td>TOTAL LIABILITIES + EQUITY</td>
            <td class="amount">$0.00</td>
          </tr>
        </table>
      `;
    }
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Financial Reports</h2>
        <p className="text-gray-400">Generate professional financial statements and tax reports</p>
      </div>

      {/* Report Selection */}
      {!selectedReport && (
        <div className="grid grid-cols-2 gap-4">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`bg-gradient-to-br ${report.color} border rounded-lg p-6 text-left hover:scale-105 transition-transform`}
            >
              <div className="text-4xl mb-3">{report.icon}</div>
              <h3 className="text-xl font-bold text-white mb-1">{report.name}</h3>
              <p className="text-sm text-gray-400">{report.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* Report Configuration */}
      {selectedReport && (
        <div className="space-y-6">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedReport(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Reports
            </button>
            <div className="flex items-center gap-3">
              <button 
                onClick={downloadPDF}
                disabled={loading || !reportData}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={20} />
                Download PDF
              </button>
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Report Configuration</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Accounting Basis</label>
                <select
                  value={basis}
                  onChange={(e) => setBasis(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="accrual">Accrual Basis</option>
                  <option value="cash">Cash Basis</option>
                </select>
              </div>
            </div>
          </div>

          {/* Report Preview */}
          {loading ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
          ) : selectedReport === 'income' ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-1">Income Statement</h2>
                <p className="text-gray-400">
                  For the Period: {new Date(dateRange.start).toLocaleDateString()} to {new Date(dateRange.end).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">({basis.charAt(0).toUpperCase() + basis.slice(1)} Basis)</p>
              </div>

              <div className="space-y-6 max-w-2xl mx-auto">
                {/* Revenue Section */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-700 pb-2">REVENUE</h3>
                  <div className="flex justify-between font-bold text-white border-t border-gray-700 pt-2 mt-2">
                    <span>Total Revenue</span>
                    <span>${reportData?.total_revenue?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</span>
                  </div>
                </div>

                {/* Expenses Section */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-700 pb-2">EXPENSES</h3>
                  <div className="flex justify-between font-bold text-white border-t border-gray-700 pt-2 mt-2">
                    <span>Total Expenses</span>
                    <span>${reportData?.total_expenses?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</span>
                  </div>
                </div>

                {/* Net Income */}
                <div className="bg-gradient-to-r from-[#6E86FF]/10 to-[#B279DB]/10 border-2 border-[#6E86FF]/30 rounded-lg p-4">
                  <div className="flex justify-between font-bold text-white text-xl mb-2">
                    <span>NET INCOME</span>
                    <span className={(reportData?.net_profit || 0) >= 0 ? 'text-[#34D399]' : 'text-[#FF6BBA]'}>
                      ${reportData?.net_profit?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 text-right">
                    {reportData?.profit_margin?.toFixed(1) || '0.0'}% Net Profit Margin
                  </div>
                </div>
              </div>
            </div>
          ) : selectedReport === 'balance' ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-1">Balance Sheet</h2>
                <p className="text-gray-400">As of: {new Date(dateRange.end).toLocaleDateString()}</p>
              </div>

              <div className="space-y-6 max-w-2xl mx-auto">
                {/* Empty state */}
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚖️</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Balance Sheet Coming Soon</h3>
                  <p className="text-gray-400">
                    Add assets and liabilities to generate your balance sheet
                  </p>
                </div>
              </div>
            </div>
          ) : selectedReport === 'cashflow' ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💵</div>
                <h3 className="text-xl font-semibold text-white mb-2">Cash Flow Statement</h3>
                <p className="text-gray-400">Operating, Investing & Financing Activities</p>
                <p className="text-sm mt-4 text-gray-500">Coming soon...</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-1">Tax Reports</h2>
                <p className="text-gray-400">1099-NEC Forms, Mileage Logs & Tax Deduction Summaries</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <div className="text-4xl mb-3">📋</div>
                  <h3 className="text-lg font-semibold text-white mb-1">1099-NEC Generator</h3>
                  <p className="text-sm text-gray-400">Generate 1099 forms for contractors</p>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <div className="text-4xl mb-3">🚗</div>
                  <h3 className="text-lg font-semibold text-white mb-1">Mileage Log</h3>
                  <p className="text-sm text-gray-400">IRS-compliant mileage report</p>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <div className="text-4xl mb-3">📊</div>
                  <h3 className="text-lg font-semibold text-white mb-1">Tax Deduction Summary</h3>
                  <p className="text-sm text-gray-400">Summary by IRS category</p>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <div className="text-4xl mb-3">🧾</div>
                  <h3 className="text-lg font-semibold text-white mb-1">Receipt Archive</h3>
                  <p className="text-sm text-gray-400">All receipts organized by date</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}