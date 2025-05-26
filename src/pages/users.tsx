'use client';
import React, { useRef, useState, useEffect } from "react";
import { ActionType, ProTable } from "@ant-design/pro-components";
import { Button, Tag, Modal, Image, message, Select, GetProp } from "antd";
import { get, put, post } from '@/services/request';
import Layout from "@/components/Layout";
import type { ProColumns } from '@ant-design/pro-components';
import { Checkbox } from 'antd';


const UsersPage = () => {
  const ref = useRef<ActionType>();
  const [isClient, setIsClient] = useState(false);
  const [cardList, setCardList] = useState<Array<{deck_name: string, levels: string[]}>>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newUser, setNewUser] = useState({
    phone: '',
    auth_card_level: [] as string[]
  });

  const getAllCard = async () => {
    const response = [
      { deck_name: "陈靖韬灵犀心理牌", levels: ["z1", "z2", "z3"] },
      { deck_name: "陈靖韬虹道励志牌", levels: ["x1", "x2", "x3"] },
      { deck_name: "陈靖韬明心思维牌", levels: ["a1", "a2", "a3"] }
    ];
    setCardList(response);
  }
  useEffect(() => {
    setIsClient(true);
    getAllCard();
  }, []);

  const handleCreateUser = async () => {
    try {
      await post('/userscreate', newUser);
      message.success('创建用户成功');
      setCreateModalVisible(false);
      setNewUser({ phone: '', auth_card_level: [] });
      ref.current?.reload();
    } catch (error) {
      // 错误已经被请求服务处理
    }
  };

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
      title: '用户姓名',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      search: true,
    },
    {
      title: '用户等级',
      dataIndex: 'auth_card_level',
      key: 'auth_card_level',
      render: (_, record) => {
        let auth_card_level = [];
        try {
          if (typeof record.auth_card_level === 'string') {
            auth_card_level = JSON.parse(record.auth_card_level);
          } else if (Array.isArray(record.auth_card_level)) {
            auth_card_level = record.auth_card_level;
          }
        } catch (e) {
          console.error('解析用户等级错误:', e);
        }
        
        return auth_card_level.map((item: any) => {
          let color = 'blue';
          if (item.startsWith('z')) color = 'green';
          if (item.startsWith('x')) color = 'orange';
          if (item.startsWith('a')) color = 'purple';
          return <Tag color={color}>{item}</Tag>;
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
              title: '修改用户等级',
              content: (
                <div>
                  {cardList.map((card: any) => (
                    <div key={card.deck_name} style={{ marginBottom: '16px' }}>
                      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>{card.deck_name}</div>
                      <Select
                        style={{ width: '100%' }}
                        placeholder={`请选择${card.deck_name}等级`}
                        defaultValue={record.auth_card_level ? 
                          (typeof record.auth_card_level === 'string' ? 
                            JSON.parse(record.auth_card_level) : 
                            record.auth_card_level
                          )?.find((level: string) => card.levels.includes(level)) : 
                          undefined
                        }
                        onChange={(value) => {
                          let auth_card_level = [];
                          try {
                            if (typeof record.auth_card_level === 'string') {
                              auth_card_level = JSON.parse(record.auth_card_level);
                            } else if (Array.isArray(record.auth_card_level)) {
                              auth_card_level = record.auth_card_level;
                            }
                          } catch (e) {
                            console.error('解析用户等级错误:', e);
                          }
                          
                          // 移除同类型的其他等级
                          auth_card_level = auth_card_level.filter((level: string) => !card.levels.includes(level));
                          if (value) {
                            auth_card_level.push(value);
                          }
                          record.auth_card_level = auth_card_level;
                        }}
                      >
                        <Select.Option value="">无权限</Select.Option>
                        {card.levels.map((level: string) => (
                          <Select.Option key={level} value={level}>{level}</Select.Option>
                        ))}
                      </Select>
                    </div>
                  ))}
                </div>
              ),
              onOk: () => {
                put('/userssetLevel', { id: record.id, auth_card_level: record.auth_card_level });
                message.success('修改成功');
                ref.current?.reload();
              },
            });
          }}
        >
          修改等级
        </Button>,
      ],
    },
  ];
  
  return (
    <Layout>
      {isClient ? (
        <>
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
              labelWidth: 120,
            }}
            toolBarRender={() => [
              <Button
                key="create"
                type="primary"
                onClick={() => setCreateModalVisible(true)}
              >
                新建用户
              </Button>
            ]}
          />

          <Modal
            title="新建用户"
            open={createModalVisible}
            onOk={handleCreateUser}
            onCancel={() => {
              setCreateModalVisible(false);
              setNewUser({ phone: '', auth_card_level: [] });
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px' }}>手机号</div>
              <input
                type="text"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px'
                }}
                placeholder="请输入手机号"
              />
            </div>
            <div>
              <div style={{ marginBottom: '8px' }}>用户等级</div>
              {cardList.map((card: any) => (
                <div key={card.deck_name} style={{ marginBottom: '16px' }}>
                  <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>{card.deck_name}</div>
                  <Select
                    style={{ width: '100%' }}
                    placeholder={`请选择${card.deck_name}等级`}
                    onChange={(value) => {
                      let auth_card_level = [...newUser.auth_card_level];
                      // 移除同类型的其他等级
                      auth_card_level = auth_card_level.filter((level: string) => !card.levels.includes(level));
                      if (value) {
                        auth_card_level.push(value);
                      }
                      setNewUser({ ...newUser, auth_card_level });
                    }}
                  >
                    <Select.Option value="">无权限</Select.Option>
                    {card.levels.map((level: string) => (
                      <Select.Option key={level} value={level}>{level}</Select.Option>
                    ))}
                  </Select>
                </div>
              ))}
            </div>
          </Modal>
        </>
      ) : null}
    </Layout>
  );
};

export default UsersPage; 