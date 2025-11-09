<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .invoice-details {
            margin-bottom: 30px;
        }
        .invoice-details table {
            width: 100%;
        }
        .invoice-details td {
            padding: 5px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .items-table th {
            background-color: #f0f0f0;
            padding: 10px;
            text-align: left;
            border-bottom: 2px solid #333;
        }
        .items-table td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
        }
        .text-right {
            text-align: right;
        }
        .totals {
            float: right;
            width: 300px;
        }
        .totals table {
            width: 100%;
        }
        .totals td {
            padding: 5px;
        }
        .total-row {
            font-weight: bold;
            font-size: 14px;
            border-top: 2px solid #333;
        }
        .notes {
            margin-top: 30px;
            clear: both;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">YOUR COMPANY NAME</div>
        <div>Your Company Address</div>
        <div>Phone: (123) 456-7890 | Email: info@company.com</div>
    </div>

    <div class="invoice-details">
        <table>
            <tr>
                <td style="width: 50%;">
                    <strong>Bill To:</strong><br>
                    {{ $invoice->clientKey->name ?? 'N/A' }}<br>
                    @if($invoice->clientKey->email)
                        {{ $invoice->clientKey->email }}<br>
                    @endif
                </td>
                <td style="width: 50%; text-align: right;">
                    <strong>Invoice #:</strong> {{ $invoice->invoice_number }}<br>
                    <strong>Date:</strong> {{ \Carbon\Carbon::parse($invoice->invoice_date)->format('M d, Y') }}<br>
                    <strong>Due Date:</strong> {{ \Carbon\Carbon::parse($invoice->due_date)->format('M d, Y') }}<br>
                    <strong>Status:</strong> {{ ucfirst($invoice->status) }}
                </td>
            </tr>
        </table>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 50%;">Description</th>
                <th style="width: 15%; text-align: right;">Quantity</th>
                <th style="width: 15%; text-align: right;">Rate</th>
                <th style="width: 20%; text-align: right;">Amount</th>
            </tr>
        </thead>
        <tbody>
            @php
                $items = is_string($invoice->items) ? json_decode($invoice->items, true) : $invoice->items;
            @endphp
            
            @if(is_array($items))
                @foreach($items as $item)
                    <tr>
                        <td>{{ $item['description'] ?? '' }}</td>
                        <td class="text-right">{{ number_format($item['quantity'] ?? 0, 2) }}</td>
                        <td class="text-right">₱{{ number_format($item['rate'] ?? 0, 2) }}</td>
                        <td class="text-right">₱{{ number_format(($item['quantity'] ?? 0) * ($item['rate'] ?? 0), 2) }}</td>
                    </tr>
                @endforeach
            @endif
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td>Subtotal:</td>
                <td class="text-right">₱{{ number_format($invoice->subtotal, 2) }}</td>
            </tr>
            @if($invoice->tax_rate > 0)
                <tr>
                    <td>Tax ({{ $invoice->tax_rate }}%):</td>
                    <td class="text-right">₱{{ number_format($invoice->tax_amount, 2) }}</td>
                </tr>
            @endif
            @if($invoice->discount > 0)
                <tr>
                    <td>Discount:</td>
                    <td class="text-right">-₱{{ number_format($invoice->discount, 2) }}</td>
                </tr>
            @endif
            <tr class="total-row">
                <td>Total:</td>
                <td class="text-right">₱{{ number_format($invoice->amount, 2) }}</td>
            </tr>
            @if($invoice->payments && $invoice->payments->count() > 0)
                <tr>
                    <td>Paid:</td>
                    <td class="text-right">₱{{ number_format($invoice->payments->sum('amount'), 2) }}</td>
                </tr>
                <tr class="total-row">
                    <td>Balance Due:</td>
                    <td class="text-right">₱{{ number_format($invoice->amount - $invoice->payments->sum('amount'), 2) }}</td>
                </tr>
            @endif
        </table>
    </div>

    @if($invoice->notes)
        <div class="notes">
            <strong>Notes:</strong><br>
            {{ $invoice->notes }}
        </div>
    @endif

    @if($invoice->payment_terms)
        <div class="notes">
            <strong>Payment Terms:</strong> {{ $invoice->payment_terms }}
        </div>
    @endif

    <div class="footer">
        <p>Thank you for your business!</p>
    </div>
</body>
</html>