import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8100';

async function proxyRequest(
  request: NextRequest,
  method: string
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  // /api/resource/Supplier -> resource/Supplier
  const pathSegments = request.nextUrl.pathname.replace('/api/', '');
  const queryString = searchParams.toString();
  // Frappe expects /api/resource/Supplier, so we need to add /api back
  const targetUrl = `${API_URL}/api/${pathSegments}${queryString ? `?${queryString}` : ''}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  // Preserve the original Content-Type from the request
  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers['Content-Type'] = contentType;
  } else {
    headers['Content-Type'] = 'application/json';
  }

  // Forward all cookies from the request
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    headers.Cookie = cookieHeader;
    console.log(`[Proxy] Forwarding cookies: ${cookieHeader.substring(0, 100)}...`);
  } else {
    console.log(`[Proxy] No cookies found in request`);
  }

  const csrfToken = request.cookies.get('csrf_token')?.value;
  if (csrfToken) {
    headers['X-Frappe-CSRF-Token'] = csrfToken;
  }

  try {
    let body: string | undefined;
    
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const bodyText = await request.text();
      if (bodyText && bodyText.length > 0) {
        body = bodyText;
      }
    }

    const options: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };

    if (body) {
      options.body = body;
    }

    console.log(`[Proxy ${method}] ${targetUrl}`);
    if (body) {
      console.log(`[Proxy Body] ${body.substring(0, 200)}...`);
    }

    const response = await fetch(targetUrl, options);

    if (response.status >= 400) {
      const errorText = await response.text();
      console.error(`[${method} Error] ${response.status} ${pathSegments}`);
      console.error(`[Error Body] ${errorText.substring(0, 500)}`);
      
      // Return error response as-is
      const responseHeaders = new Headers();
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'content-length') {
          responseHeaders.set(key, value);
        }
      });
      
      return new NextResponse(errorText, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-length') {
        responseHeaders.set(key, value);
      }
    });

    const setCookieHeaders = response.headers.getSetCookie();
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      console.log(`[Proxy] Received ${setCookieHeaders.length} Set-Cookie headers from Frappe`);
      setCookieHeaders.forEach((cookie) => {
        // Remove domain and secure attributes to make cookies work on localhost:3000
        let modifiedCookie = cookie
          .replace(/Domain=[^;]+;?\s*/gi, '')
          .replace(/Secure;?\s*/gi, '')
          .replace(/SameSite=None;?\s*/gi, 'SameSite=Lax;');
        
        console.log(`[Proxy] Setting cookie: ${modifiedCookie.substring(0, 50)}...`);
        responseHeaders.append('Set-Cookie', modifiedCookie);
      });
    }

    const responseBody = await response.arrayBuffer();

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`[${method} Error]`, error);
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, 'DELETE');
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, 'PATCH');
}
