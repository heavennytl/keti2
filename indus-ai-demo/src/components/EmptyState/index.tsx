import { InboxOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  description?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ description = '暂无数据', icon }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon || <InboxOutlined />}
      <div style={{ fontSize: 14, marginTop: 8 }}>{description}</div>
    </div>
  );
}
