export type ShippingMethod = "standard" | "expedited" | "overnight" | "international";
export type ShipCountry = "US" | "CA" | "GB";

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

// Outside the US it's always DHL, always a flat rate — no free-shipping
// threshold, no expedited/overnight tiers. Domestic (US) keeps the
// standard/expedited/overnight structure.
export function priceShippingMethod(
  method: ShippingMethod,
  subtotalCents: number,
  rates: ShippingRates,
  country: ShipCountry = "US"
): number {
  if (country !== "US") return rates.internationalCents;
  if (method === "expedited") return rates.expeditedCents;
  if (method === "overnight") return rates.overnightCents;
  return subtotalCents >= rates.freeThresholdCents ? 0 : rates.standardCents;
}

export function shippingOptions(subtotalCents: number, rates: ShippingRates, country: ShipCountry = "US") {
  if (country !== "US") {
    return [
      {
        id: "international" as const,
        label: "International (DHL)",
        note: "Flat rate, outside the US",
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
      note: "FedEx 2-Day",
      cents: priceShippingMethod("expedited", subtotalCents, rates, country),
    },
    {
      id: "overnight" as const,
      label: "Overnight",
      note: "FedEx, within 24h · US only",
      cents: priceShippingMethod("overnight", subtotalCents, rates, country),
    },
  ];
}
