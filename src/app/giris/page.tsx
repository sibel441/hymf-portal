import { GirisFormu } from './GirisFormu';
import { guvenliIcYol } from '@/lib/yonlendirme';

interface GirisPageProps {
  searchParams: Promise<{ next?: string; hata?: string }>;
}

export default async function GirisPage(props: GirisPageProps) {
  const params = await props.searchParams;
  const validNext = guvenliIcYol(params.next);
  const hata = params.hata;

  const hataMetni = hata === 'baglanti' ? 'Bağlantının süresi dolmuş veya geçersiz. Yeniden deneyin.' : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl mb-2">Giriş Yapın</h1>
          <p className="text-ink-3 text-sm">E-posta ve şifrenizle oturum açın</p>
        </div>
        <GirisFormu next={validNext} hataParam={hataMetni} />
      </div>
    </div>
  );
}
