'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { itemAPI } from '@/services/item';
import { purchaseOrderAPI } from '@/services/purchase-order';
import { salesOrderAPI } from '@/services/sales-order';
import { customerAPI } from '@/services/customer';

type Activity = {
  id: string;
  type: 'sales-order' | 'purchase-order' | 'customer' | 'item';
  title: string;
  description: string;
  timestamp: Date;
  color: string;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalItems: 0,
    todayPurchaseOrders: 0,
    todaySalesOrders: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days === 1) return '어제';
    return `${days}일 전`;
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];

        // 총 물품 수
        const items = await itemAPI.list({
          filters: { disabled: 0 },
          limit_page_length: 9999,
        });

        // 금일 입고주문 (구매주문)
        const purchaseOrders = await purchaseOrderAPI.list({
          filters: { transaction_date: today },
          limit_page_length: 9999,
        });

        // 금일 출고주문 (판매주문)
        const salesOrders = await salesOrderAPI.list({
          filters: { transaction_date: today },
          limit_page_length: 9999,
        });

        setStats({
          totalItems: items.length,
          todayPurchaseOrders: purchaseOrders.length,
          todaySalesOrders: salesOrders.length,
        });

        // 최근 활동 데이터 생성
        const recentActivities: Activity[] = [];

        // 최근 판매주문 (최대 3개)
        const recentSalesOrders = await salesOrderAPI.list({
          limit_page_length: 3,
          order_by: 'modified desc',
        });
        recentSalesOrders.forEach((order) => {
          recentActivities.push({
            id: order.name,
            type: 'sales-order',
            title: '새로운 판매주문이 생성되었습니다',
            description: `주문번호: ${order.name} | 고객: ${order.customer_name || order.customer}`,
            timestamp: new Date(order.modified || order.creation || new Date()),
            color: 'bg-blue-500',
          });
        });

        // 최근 구매주문 (최대 3개)
        const recentPurchaseOrders = await purchaseOrderAPI.list({
          limit_page_length: 3,
          order_by: 'modified desc',
        });
        recentPurchaseOrders.forEach((order) => {
          recentActivities.push({
            id: order.name,
            type: 'purchase-order',
            title: order.docstatus === 1 ? '구매주문이 승인되었습니다' : '새로운 구매주문이 생성되었습니다',
            description: `주문번호: ${order.name} | 공급업체: ${order.supplier}`,
            timestamp: new Date(order.modified || order.creation || new Date()),
            color: 'bg-green-500',
          });
        });

        // 최근 고객 (최대 2개)
        const recentCustomers = await customerAPI.list({
          limit_page_length: 2,
          order_by: 'modified desc',
        });
        recentCustomers.forEach((customer) => {
          recentActivities.push({
            id: customer.name,
            type: 'customer',
            title: '새로운 고객이 등록되었습니다',
            description: `고객명: ${customer.customer_name} | 유형: ${customer.customer_type} | 그룹: ${customer.customer_group}`,
            timestamp: new Date(customer.creation || new Date()),
            color: 'bg-purple-500',
          });
        });

        // 최근 물품 (최대 2개)
        const recentItems = await itemAPI.list({
          limit_page_length: 2,
          order_by: 'modified desc',
        });
        recentItems.forEach((item) => {
          recentActivities.push({
            id: item.name,
            type: 'item',
            title: '물품정보가 수정되었습니다',
            description: `품목코드: ${item.item_code} | 품목명: ${item.item_name}`,
            timestamp: new Date(item.creation || new Date()),
            color: 'bg-gray-500',
          });
        });

        // 시간순으로 정렬
        recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setActivities(recentActivities.slice(0, 10)); // 최대 10개

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">대시보드</h1>
        <p className="text-gray-600 mb-8">Welcome, {user?.name || user?.email}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* 통계 카드 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">총 물품 수</h3>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '-' : stats.totalItems.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">금일 구매주문</h3>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '-' : stats.todayPurchaseOrders.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">금일 판매주문</h3>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '-' : stats.todaySalesOrders.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-semibold mb-4">최근 활동</h2>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">로딩 중...</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">최근 활동이 없습니다.</div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-2 h-2 ${activity.color} rounded-full mt-2`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <span className="text-sm text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
