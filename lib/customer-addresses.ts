export type AddressRow = {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type CustomerAddress = {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export function mapCustomerAddress(row: AddressRow): CustomerAddress {
  return {
    id: row.id,
    label: row.label,
    name: row.full_name,
    phone: row.phone,
    line1: row.address_line1,
    line2: row.address_line2 || '',
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    isDefault: row.is_default,
  };
}

export function toAddressPayload(address: CustomerAddress) {
  return {
    label: address.label,
    full_name: address.name,
    phone: address.phone,
    address_line1: address.line1,
    address_line2: address.line2 || null,
    city: address.city,
    state: address.state,
    postal_code: address.postalCode,
    country: address.country,
  };
}
