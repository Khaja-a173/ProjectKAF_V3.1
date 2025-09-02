import { useState } from 'react';

type Props = {
  open: boolean;
  onSubmit: (pin: string) => Promise<void>;
  onClose: () => void;
};

export default function JoinPinModal({ open, onSubmit, onClose }: Props) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState<string | null>(null);
  if (!open) return null;

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,.35)',
      display:'grid', placeItems:'center', zIndex:1000
    }}>
      <div style={{background:'#fff', padding:16, borderRadius:12, minWidth:280}}>
        <h3 style={{marginTop:0}}>Enter Join PIN</h3>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          value={pin}
          onChange={(e)=>setPin(e.target.value.replace(/\D/g,''))}
          placeholder="4–6 digits"
          style={{width:'100%', fontSize:18, padding:8}}
        />
        {err && <div style={{color:'#b71c1c', marginTop:8}}>{err}</div>}
        <div style={{display:'flex', gap:8, marginTop:12, justifyContent:'flex-end'}}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={async ()=>{
            setErr(null);
            try { await onSubmit(pin); }
            catch(e:any){ setErr(e?.message ?? 'Invalid PIN'); }
          }}>Join</button>
        </div>
      </div>
    </div>
  );
}