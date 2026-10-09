// Geçici sayfa: gerçek çalışma alanı Dalga 2'de (H5) bu dosyanın yerine yazılacak. Bkz. docs/PLAN.md §5.
import { BosDurum, SayfaBasligi } from '@/components/ui';

export default function CalismaAlaniPage() {
  return (
    <div className="space-y-8">
      <SayfaBasligi baslik="Çalışma alanı" />
      <BosDurum baslik="Çalışma alanı hazırlanıyor" aciklama="Bu sayfa yakında plan takibiyle birlikte açılacak." />
    </div>
  );
}
