import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#f3ede4', color:'#3b281f', fontFamily:'Arial, sans-serif', position:'relative' }}>
      <div style={{ position:'absolute', inset:36, border:'1px solid #b68d57', borderRadius:36 }} />
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:18 }}>
        <div style={{ fontSize:28, letterSpacing:8, textTransform:'uppercase', color:'#85653f' }}>Spin Out</div>
        <div style={{ fontSize:84, fontWeight:700, letterSpacing:-5 }}>About to gamble?</div>
        <div style={{ fontSize:36, color:'#6d5a4f' }}>Run it here first.</div>
      </div>
    </div>,
    size,
  );
}
