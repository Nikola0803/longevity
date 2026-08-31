export type ShippingMethod = "standard" | "expedited" | "overnight" | "international";
export type ShipCountry = "AU" | "NZ";

export interface ShippingRates {
  freeThresholdCents: number;
  standardCents: number;
  expeditedCents: number;
  overnightCents: number;
  internationalCents: number;
}

export const DEFAULT_SHIPPING_RATES: ShippingRates = {
  freeThresholdCents: 35000,
  standardCents: 1500,
  expeditedCents: 2500,
  overnightCents: 7500,
  internationalCents: 7500,
};

// Australia is the domestic market (standard/expedited/overnight tiers);
// New Zealand ships as a flat international rate — matching how the
// original longevity-peps region store treated AU as the primary market.
export function priceShippingMethod(
  method: ShippingMethod,
  subtotalCents: number,
  rates: ShippingRates,
  country: ShipCountry = "AU"
): number {
  if (country !== "AU") return rates.internationalCents;
  if (method === "expedited") return rates.expeditedCents;
  if (method === "overnight") return rates.overnightCents;
  return subtotalCents >= rates.freeThresholdCents ? 0 : rates.standardCents;
}

export function shippingOptions(subtotalCents: number, rates: ShippingRates, country: ShipCountry = "AU") {
  if (country !== "AU") {
    return [
      {
        id: "international" as const,
        label: "International",
        note: "Flat rate, outside Australia",
        cents: rates.internationalCents,
      },
    ];
  }
  return [
    {
      id: "standard" as const,
      label: "Standard",
      note: subtotalCents >= rates.freeThresholdCents ? "Free" : "3–7 business days",
      cents: priceShippingMethod("standard", subtotalCents, rates, country),
    },
    {
      id: "expedited" as const,
      label: "Expedited",
      note: "2-Day",
      cents: priceShippingMethod("expedited", subtotalCents, rates, country),
    },
    {
      id: "overnight" as const,
      label: "Overnight",
      note: "Within 24h · AU only",
      cents: priceShippingMethod("overnight", subtotalCents, rates, country),
    },
  ];
}
