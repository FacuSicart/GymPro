import { redirect } from 'next/navigation';

export default function PendingTrainersRedirectPage() {
  redirect('/entrenadores?status=PENDING_APPROVAL');
}
