import { Property } from '../models/property.model';
import { Unit } from '../models/unit.model';
import { tenantService } from '../services/tenant.service';

interface CsvRow {
  property: string;
  unitNumber: string;
  squareMeters?: string;
  rooms?: string;
  monthlyRent?: string;
  tenantFirstName?: string;
  tenantLastName?: string;
  tenantEmail?: string;
  tenantPhone?: string;
  moveInDate?: string;
}

export async function importCsv(content: string, landlordId: string) {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const created: any[] = [];

  for (const line of lines.slice(1)) {
    const values = line.split(',');
    const row: any = {};
    headers.forEach((h, idx) => { row[h] = (values[idx] || '').trim(); });

    const data = row as CsvRow;
    if (!data.property || !data.unitNumber) continue;

    let property = await Property.findOne({ name: data.property, owner: landlordId });
    if (!property) {
      property = await Property.create({
        name: data.property,
        address: { street: '', city: '', postalCode: '', country: 'Germany' },
        owner: landlordId,
        totalUnits: 0
      });
    }

    let unit = await Unit.findOne({ property: property._id, unitNumber: data.unitNumber });
    if (!unit) {
      unit = await Unit.create({
        property: property._id,
        unitNumber: data.unitNumber,
        squareMeters: Number(data.squareMeters || 0),
        rooms: Number(data.rooms || 1),
        monthlyRent: Number(data.monthlyRent || 0),
        status: 'vacant'
      });
      property.totalUnits += 1;
      await property.save();
    }

    if (data.tenantEmail) {
      await tenantService.createTenant(property._id.toString(), unit._id.toString(), {
        firstName: data.tenantFirstName || 'Vorname',
        lastName: data.tenantLastName || 'Nachname',
        email: data.tenantEmail,
        phone: data.tenantPhone || '',
        moveInDate: data.moveInDate ? new Date(data.moveInDate) : new Date()
      });
    }

    created.push({ property: property._id, unit: unit._id });
  }

  return created;
}
