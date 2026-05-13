import { Button } from 'antd';
import { WarningOutlined } from '@ant-design/icons';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = '加载失败，请稍后重试', onRetry }: ErrorStateProps) {
  return (
    <div className="error-state">
      <WarningOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }} />
      <div style={{ fontSize: 14, marginBottom: 16 }}>{message}</div>
      {onRetry && (
        <Button type="primary" size="small" onClick={onRetry}>
          重新加载
        </Button>
      )}
    </div>
  );
}
