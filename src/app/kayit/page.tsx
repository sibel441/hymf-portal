import { KayitFormu } from './KayitFormu';

export default function KayitPage() {
  return (
    <div className="mx-auto max-w-sm py-4 sm:py-10">
      <h1 className="font-serif text-2xl text-ink sm:text-4xl">Kayıt ol</h1>
      <p className="mt-2 text-base text-ink-2">Davet listesindeki adresler doğrulamadan sonra otomatik açılır; diğer hesapları bir yönetici onaylar.</p>
      <div className="mt-8">
        <KayitFormu />
      </div>
    </div>
  );
}
