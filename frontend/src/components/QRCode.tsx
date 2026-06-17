import { QRCodeSVG } from 'qrcode.react'

interface Props {
  value: string
}

export default function QRCode({ value }: Props) {
  return (
    <div style={{ background: '#fff', padding: '1rem', borderRadius: '0.75rem', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', display: 'inline-block' }}>
      <QRCodeSVG value={value} size={180} />
    </div>
  )
}
