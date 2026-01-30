import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const backendUrl = process.env.BACKEND_URL;

        if (!backendUrl) {
            return NextResponse.json({ error: 'Backend URL not configured' }, { status: 500 });
        }

        const response = await fetch(`${backendUrl}/trip/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('Error in trip proxy:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
