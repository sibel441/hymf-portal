import { KayitFormu } from './KayitFormu';

export default function KayitPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl mb-2">Yeni Araştırmacı Kaydı</h1>
          <p className="text-ink-3 text-sm">Portala katılmak için kayıt olun</p>
        </div>
        <KayitFormu />
      </div>
    </div>
  );
}
