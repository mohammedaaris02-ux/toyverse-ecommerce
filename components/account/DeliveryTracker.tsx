import { Check, Circle } from 'lucide-react';
const steps = [
  'assigned',
  'picked_up',
  'in_transit',
  'out_for_delivery',
  'delivered',
];
const labels: Record<string, string> = {
  assigned: 'Delivery Assigned',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};
type TrackingEvent = { id: string; status: string; message: string | null };
type TrackingAssignment = {
  status: string;
  expected_delivery_date: string | null;
  delivery_agents: {
    full_name: string;
    phone: string | null;
    vehicle_type: string | null;
    vehicle_number: string | null;
  } | null;
};
export function DeliveryTracker({
  orderStatus,
  assignment,
  events,
}: {
  orderStatus: string;
  assignment: TrackingAssignment | null;
  events: TrackingEvent[];
}) {
  const current = assignment?.status || 'unassigned';
  const position = steps.indexOf(current);
  return (
    <section className="rounded-[20px] border border-[#E6EAF2] bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold">Delivery Tracking</h2>
      {orderStatus === 'cancelled' ? (
        <p className="mt-4 text-[#667085]">
          This order was cancelled before shipment.
        </p>
      ) : !assignment ? (
        <p className="mt-4 text-[#667085]">
          Delivery partner has not been assigned yet.
        </p>
      ) : (
        <>
          <div className="mt-5 grid gap-3">
            {steps.map((step, index) => {
              const done = position >= index;
              return (
                <div key={step} className="flex items-center gap-3">
                  <span
                    className={
                      done
                        ? 'grid size-8 place-items-center rounded-full bg-[#6D4AFF] text-white'
                        : 'grid size-8 place-items-center rounded-full bg-[#F2F4F7] text-[#98A2B3]'
                    }
                  >
                    {done ? (
                      <Check className="size-4" />
                    ) : (
                      <Circle className="size-4" />
                    )}
                  </span>
                  <span className={done ? 'font-semibold' : 'text-[#667085]'}>
                    {labels[step]}
                  </span>
                </div>
              );
            })}
          </div>
          {assignment.delivery_agents && (
            <div className="mt-5 border-t pt-5 text-sm leading-6">
              <strong>Assigned Delivery Partner</strong>
              <p>{assignment.delivery_agents.full_name}</p>
              {assignment.delivery_agents.phone && (
                <p>{assignment.delivery_agents.phone}</p>
              )}
              {assignment.delivery_agents.vehicle_type && (
                <p>
                  {assignment.delivery_agents.vehicle_type}{' '}
                  {assignment.delivery_agents.vehicle_number || ''}
                </p>
              )}
              {assignment.expected_delivery_date && (
                <p>
                  Expected:{' '}
                  {new Date(
                    `${assignment.expected_delivery_date}T00:00:00`,
                  ).toLocaleDateString('en-IN')}
                </p>
              )}
            </div>
          )}
          <div className="mt-5 border-t pt-5">
            {events.map((event) => (
              <div
                key={event.id}
                className="mb-3 border-l-2 border-[#6D4AFF] pl-3"
              >
                <strong className="text-sm">
                  {labels[event.status] || event.status.replaceAll('_', ' ')}
                </strong>
                <p className="text-sm text-[#667085]">{event.message}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
