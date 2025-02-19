'use client';
import React, { useRef, useState, useEffect } from "react";
import { ActionType, ProTable } from "@ant-design/pro-components";
import { Button, Tag, Modal, Image, message, Select, GetProp } from "antd";
import { get, put } from '@/services/request';
import Layout from "@/components/Layout";
import type { ProColumns } from '@ant-design/pro-components';
import { Checkbox } from 'antd';


const UsersPage = () => {
  const ref = useRef<ActionType>();
  const [isClient, setIsClient] = useState(false);
  const [cardList, setCardList] = useState([]);
  const getAllCard = async () => {
    const response: any = [{"deck_name":"陈靖韬灵犀心理牌"},{"deck_name":"陈靖韬虹道励志牌"}];
    setCardList(response);
  }
  useEffect(() => {
    setIsClient(true);
    getAllCard();
  }, []);


  const columns: ProColumns<any>[] = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
      search: false,
      align: 'center',
    },
    {
      title: '用户手机号',
      dataIndex: 'phone',
      key: 'phone',
      align: 'center',
    },
    {
      title: '套牌权限',
      dataIndex: 'auth_card',
      key: 'auth_card',
      render: (_, record) => {
        if (typeof record.auth_card === 'string') {
          record.auth_card = JSON.parse(record.auth_card);
        }
        const auth_card = record.auth_card || [];
        return auth_card.map((item: any) => {
          return <Tag color='blue'>{item}</Tag>;
        });
      },
      align: 'center',
      search: false,
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      valueType: 'dateTime',
      search: false,
      align: 'center',
    },
    {
      title: '操作',
      valueType: 'option',
      align: 'center',
      render: (_, record) => [
        <Button
          key="changeType"
          type="link"
          onClick={() => {
            Modal.confirm({
              title: '修改套牌权限',
              content: (
                <Checkbox.Group options={cardList.map((item: any) => ({ label: item.deck_name, value: item.deck_name }))} defaultValue={record.auth_card} onChange={(value) => {
                  record.auth_card = value;
                }} />
              ),
              onOk: () => {
                put('/users', { id: record.id, auth_card: record.auth_card });
                message.success('修改成功');
                ref.current?.reload();
              },
            });
          }}
        >
          修改权限
        </Button>,
      ],
    },
  ];
  
  return (
    <Layout>
      {isClient ? (
        <ProTable<any>
          actionRef={ref}
          columns={columns}
          pagination={{
            pageSize: 10,
          }}
          request={async (params) => {
            try {
              const response = await get('/users', {
                ...params,
                pageSize: params.pageSize,
                current: params.current,
              });
              
              return {
                data: response.data.list || [],
                success: true,
                total: response.data.total || 0
              };
            } catch (error) {
              return {
                data: [],
                success: false,
                total: 0,
              };
            }
          }}
          rowKey="id"
          search={{
            labelWidth: 'auto',
            defaultCollapsed: true,
            collapseRender: (collapsed, props, intl, hiddenNum) => true,
            optionRender: (searchConfig, formProps, dom) => [
              ...dom.reverse(),
            ],
          }}
          options={{
            density: true,
            fullScreen: true,
            reload: true,
            setting: true,
          }}
          scroll={{ x: 1300 }}
          dateFormatter="string"
          headerTitle="用户管理"
        />
      ) : null}
    </Layout>
  );
};

export default UsersPage; 