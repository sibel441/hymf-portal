import React from 'react';

/** Henüz Supabase'e bağlanmamış, örnek veriyle çalışan sayfaların üstünde durur. */
export function OrnekVeriNotu() {
  return (
    <p className="border-l-2 border-line-strong pl-3 text-sm text-ink-3">
      Bu sayfadaki içerik örnek veridir. Gerçek kayıtlar henüz bağlanmadı.
    </p>
  );
}
