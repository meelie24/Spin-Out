import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:16, background:'#3d2b23', color:'#f4dcae', fontSize:34, fontWeight:800, fontFamily:'Arial, sans-serif' }}>S</div>,
    size,
  );
}
