import { NextResponse } from "next/server";

type GooglePlaceResponse = {
  id?: string;
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: Array<{
    name?: string;
    rating?: number;
    text?: { text?: string; languageCode?: string };
    publishTime?: string;
    relativePublishTimeDescription?: string;
    authorAttribution?: {
      displayName?: string;
      uri?: string;
      photoUri?: string;
    };
  }>;
};

function getText(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "text" in value) {
    const text = (value as { text?: unknown }).text;
    return typeof text === "string" ? text : "";
  }
  return "";
}

function getFallbackUrl(placeId: string | undefined) {
  return placeId
    ? `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${encodeURIComponent(placeId)}`
    : "https://www.google.com/search?q=Anderson+Palafoz+Google+Maps";
}

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  const placeId = process.env.GOOGLE_PLACE_ID?.trim();
  const fallbackUrl = getFallbackUrl(placeId);

  if (!apiKey || !placeId) {
    return NextResponse.json({
      configured: false,
      place: null,
      reviews: [],
      sourceUrl: fallbackUrl,
      message: "A integração com o Google ainda não foi configurada.",
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=pt-BR`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,reviews,googleMapsUri",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("Google Places API returned", response.status);
      return NextResponse.json({
        configured: true,
        place: null,
        reviews: [],
        sourceUrl: fallbackUrl,
        message: "O Google não respondeu aos depoimentos neste momento.",
      }, {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const place = (await response.json()) as GooglePlaceResponse;
    const reviews = (place.reviews || []).map((review, index) => ({
      id: review.name || `${place.id || placeId}-review-${index}`,
      authorName: review.authorAttribution?.displayName || "Avaliador do Google",
      authorPhotoUri: review.authorAttribution?.photoUri || null,
      authorUri: review.authorAttribution?.uri || null,
      rating: typeof review.rating === "number" ? review.rating : 0,
      comment: getText(review.text),
      publishTime: review.publishTime || null,
      relativePublishTimeDescription: review.relativePublishTimeDescription || null,
    }));

    return NextResponse.json({
      configured: true,
      place: {
        name: getText(place.displayName) || "Anderson Palafoz",
        rating: typeof place.rating === "number" ? place.rating : null,
        userRatingCount: typeof place.userRatingCount === "number" ? place.userRatingCount : null,
        googleMapsUri: place.googleMapsUri || fallbackUrl,
      },
      reviews,
      sourceUrl: place.googleMapsUri || fallbackUrl,
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to load Google reviews", error);
    return NextResponse.json({
      configured: true,
      place: null,
      reviews: [],
      sourceUrl: fallbackUrl,
      message: "Os depoimentos estão temporariamente indisponíveis.",
    }, {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
