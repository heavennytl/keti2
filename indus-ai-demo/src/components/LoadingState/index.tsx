import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingStateProps {
  tip?: string;
  fullPage?: boolean;
}

export default function LoadingState({ tip = '加载中...', fullPage = false }: LoadingStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: fullPage ? '120px 24px' : '48px 24px',
        color: 'var(--text-color-secondary)',
      }}
    >
      <Spin indicator={<LoadingOutlined style={{ fontSize: fullPage ? 48 : 32, color: 'var(--primary-color)' }} spin />} />
      <div style={{ marginTop: 16, fontSize: 14, color: 'var(--text-color-secondary)' }}>{tip}</div>
    </div>
  );
}
