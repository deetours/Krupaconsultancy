// ============================================================================
// AI INVOICE EXTRACTION SERVICE - OpenRouter (gpt-oss-20b)
// ============================================================================

export interface ExtractedInvoiceData {
  invoice_number: string | null;
  invoice_date: string | null;
  vendor_name: string | null;
  vendor_gstin: string | null;
  total_amount: number | null;
  cgst_amount: number | null;
  sgst_amount: number | null;
  igst_amount: number | null;
  gst_amount: number | null;
  hsn_code: string | null;
  confidence_per_field: {
    invoice_number: number;
    invoice_date: number;
    vendor_name: number;
    vendor_gstin: number;
    total_amount: number;
    gst_amount: number;
    hsn_code: number;
  };
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Extract invoice data using OpenRouter with gpt-oss-20b (free model)
 * @param base64Content - Base64 encoded image/PDF content
 * @param fileName - Original file name for context
 * @returns Extracted invoice data with confidence scores
 */
export async function extractInvoiceData(
  base64Content: string,
  fileName: string
): Promise<ExtractedInvoiceData> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const extractionPrompt = `You are an expert GST invoice extraction system. Analyze this invoice image/document and extract the following information in valid JSON format:

{
  "invoice_number": "exact invoice number or null",
  "invoice_date": "YYYY-MM-DD format or null",
  "vendor_name": "company/vendor name or null",
  "vendor_gstin": "15-digit GSTIN or null",
  "total_amount": "numeric total amount or null",
  "cgst_amount": "CGST amount or null",
  "sgst_amount": "SGST amount or null",
  "igst_amount": "IGST amount or null",
  "gst_amount": "total GST amount or null",
  "hsn_code": "HSN/SAC code or null",
  "confidence_per_field": {
    "invoice_number": 0.0-1.0,
    "invoice_date": 0.0-1.0,
    "vendor_name": 0.0-1.0,
    "vendor_gstin": 0.0-1.0,
    "total_amount": 0.0-1.0,
    "gst_amount": 0.0-1.0,
    "hsn_code": 0.0-1.0
  }
}

Rules:
- GSTIN must be exactly 15 characters
- Dates must be YYYY-MM-DD format
- Confidence: 0.95+ = high confidence, 0.80-0.95 = medium, <0.80 = low
- If uncertain, set to null and confidence to 0
- Return ONLY valid JSON, no markdown or text`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://krupaconsultancy.com',
        'X-Title': 'Krupa GST Automation',
      },
      body: JSON.stringify({
        model: 'gpt-oss-20b',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: extractionPrompt,
              },
              {
                type: 'image',
                image: base64Content,
              },
            ],
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent extraction
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API Error:', errorData);
      throw new Error(`OpenRouter API failed: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenRouter response');
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not find JSON in OpenRouter response');
    }

    const extracted = JSON.parse(jsonMatch[0]);

    // Validate and normalize the extracted data
    return validateExtractedData(extracted);
  } catch (error) {
    console.error('Error extracting invoice data:', error);
    throw error;
  }
}

/**
 * Validate and normalize extracted invoice data
 */
function validateExtractedData(data: any): ExtractedInvoiceData {
  return {
    invoice_number: data.invoice_number || null,
    invoice_date: data.invoice_date || null,
    vendor_name: data.vendor_name || null,
    vendor_gstin: validateGSTIN(data.vendor_gstin) ? data.vendor_gstin : null,
    total_amount: typeof data.total_amount === 'number' ? data.total_amount : null,
    cgst_amount: typeof data.cgst_amount === 'number' ? data.cgst_amount : null,
    sgst_amount: typeof data.sgst_amount === 'number' ? data.sgst_amount : null,
    igst_amount: typeof data.igst_amount === 'number' ? data.igst_amount : null,
    gst_amount: typeof data.gst_amount === 'number' ? data.gst_amount : null,
    hsn_code: data.hsn_code || null,
    confidence_per_field: {
      invoice_number: Math.min(1, Math.max(0, data.confidence_per_field?.invoice_number || 0)),
      invoice_date: Math.min(1, Math.max(0, data.confidence_per_field?.invoice_date || 0)),
      vendor_name: Math.min(1, Math.max(0, data.confidence_per_field?.vendor_name || 0)),
      vendor_gstin: Math.min(1, Math.max(0, data.confidence_per_field?.vendor_gstin || 0)),
      total_amount: Math.min(1, Math.max(0, data.confidence_per_field?.total_amount || 0)),
      gst_amount: Math.min(1, Math.max(0, data.confidence_per_field?.gst_amount || 0)),
      hsn_code: Math.min(1, Math.max(0, data.confidence_per_field?.hsn_code || 0)),
    },
  };
}

/**
 * Validate GSTIN format (15 alphanumeric characters)
 */
function validateGSTIN(gstin: any): boolean {
  if (typeof gstin !== 'string') return false;
  return /^[A-Z0-9]{15}$/.test(gstin);
}
