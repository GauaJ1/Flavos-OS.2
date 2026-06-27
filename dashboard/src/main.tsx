import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'antd/dist/reset.css'
import './styles.css'
import App from './App.tsx'
import { ConfigProvider, theme, App as AntdApp } from 'antd'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element not found')

createRoot(rootEl).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
        token: {
          colorPrimary: '#36d6ff',
          colorBgLayout: '#05080f',
          colorBgContainer: '#0b1221',
          colorBgElevated: '#0e1628',
          colorBorder: 'rgba(54, 214, 255, 0.10)',
          colorBorderSecondary: 'rgba(54, 214, 255, 0.06)',
          colorText: '#eaf2ff',
          colorTextSecondary: '#a8bbd4',
          colorTextDescription: '#6a7d99',
          colorSuccess: '#3dff9f',
          colorWarning: '#ffd166',
          colorError: '#ff5f7e',
          colorInfo: '#64a8ff',
          borderRadius: 8,
          borderRadiusLG: 16,
          borderRadiusSM: 6,
          fontFamily: `'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif`,
          fontSize: 13,
          controlHeight: 34,
        },
        components: {
          Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemHoverBg: 'rgba(54, 214, 255, 0.06)',
            darkItemSelectedBg: 'rgba(54, 214, 255, 0.10)',
            darkItemColor: '#6a7d99',
            darkItemHoverColor: '#a8bbd4',
            darkItemSelectedColor: '#36d6ff',
            itemBorderRadius: 8,
          },
          Card: {
            paddingLG: 20,
            borderRadiusLG: 16,
            headerBg: 'transparent',
            headerFontSize: 11,
            headerHeight: 48,
          },
          Table: {
            borderRadius: 12,
            headerBg: 'rgba(9, 15, 29, 0.8)',
            headerColor: '#6a7d99',
            rowHoverBg: 'rgba(54, 214, 255, 0.04)',
            borderColor: 'rgba(54, 214, 255, 0.06)',
            bodySortBg: 'transparent',
          },
          Button: {
            borderRadius: 8,
            colorPrimary: '#36d6ff',
            colorPrimaryHover: '#5ce3ff',
            primaryColor: '#02040a',
            algorithm: true,
          },
          Input: {
            borderRadius: 8,
            colorBgContainer: 'rgba(9, 15, 29, 0.8)',
            activeBorderColor: '#36d6ff',
            hoverBorderColor: 'rgba(54, 214, 255, 0.35)',
          },
          Select: {
            borderRadius: 8,
            colorBgContainer: 'rgba(9, 15, 29, 0.8)',
            optionActiveBg: 'rgba(54, 214, 255, 0.06)',
            optionSelectedBg: 'rgba(54, 214, 255, 0.10)',
          },
          Segmented: {
            borderRadius: 8,
            itemSelectedBg: 'rgba(54, 214, 255, 0.12)',
            itemSelectedColor: '#36d6ff',
          },
          Progress: {
            colorText: '#6a7d99',
            remainingColor: 'rgba(255,255,255,0.05)',
          },
          Statistic: {
            contentFontSize: 28,
          },
          Badge: {
            colorSuccess: '#3dff9f',
            colorError: '#ff5f7e',
            colorWarning: '#ffd166',
          },
          Alert: {
            borderRadius: 10,
          },
          Divider: {
            colorSplit: 'rgba(54, 214, 255, 0.08)',
          },
          Tag: {
            borderRadius: 6,
          },
        },
      }}
    >
      <AntdApp>
        <App />
      </AntdApp>
    </ConfigProvider>
  </StrictMode>,
)
