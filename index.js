const path = require('path');
const { defineConfig, loadEnv } = require('vite');
const react = require('@vitejs/plugin-react');
const gzipPlugin = require('rollup-plugin-gzip');
const eslintPlugin = require('vite-plugin-eslint2');
const stylelintPlugin = require('vite-plugin-stylelint');
const { VitePWA } = require('vite-plugin-pwa');
const AutoImport = require('unplugin-auto-import/vite');

async function createViteConfig(config) {
  const { imagetools } = await import('vite-imagetools');
  const { viteStaticCopy } = await import('vite-plugin-static-copy');

  return defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const port = env.PORT || 8001;

    function createObjectDefine(keys, isAlias = false) {
      return keys.reduce((acc, key) => {
        if (isAlias) {
          const alias = key !== 'i18n' && key !== 'assets' ? `src/${key}` : key;
          acc[key] = path.resolve(process.cwd(), alias);
        } else {
          acc[key] = JSON.stringify(env[key]);
        }
        return acc;
      }, {});
    }

    return {
      base: '/',
      build: {
        target: 'es2015',
        outDir: 'public',
        emptyOutDir: true,
        manifest: true,
        rollupOptions: {
          output: {
            entryFileNames: 'app.[hash].js',
            chunkFileNames: 'app.[hash].chunk.js',
            assetFileNames: 'assets.[hash].[ext]',
          },
        },
      },
      mode: env.NODE_ENV,
      server: {
        host: '0.0.0.0',
        port,
      },
      define: createObjectDefine(config.defineEnv),
      resolve: {
        alias: createObjectDefine(config.aliasPath, true),
        extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
      },
      plugins: [
        react(),
        eslintPlugin({
          fix: true,
        }),
        stylelintPlugin(),
        imagetools(),
        viteStaticCopy({
          targets: [
            {
              src: 'assets/fonts',
              dest: 'public/assets',
            },
            {
              src: 'assets/images',
              dest: 'public/assets',
            },
          ],
        }),
        ...(config.isUseGzip ? [
          gzipPlugin.default({
            filter: /\.(js|css)$/i,
            fileName: '',
          }),
        ] : []),
        ...(config.isUsePWA ? [
          VitePWA({
            registerType: 'autoUpdate',
            manifest: { theme_color: 'white' },
            workbox: {
              cleanupOutdatedCaches: true,
              globPatterns: [
                '**/*.{js,css,html,ico,png,jpg,gif,svg,webmanifest,txt,eot,ttf,woff,otf}',
              ],
              maximumFileSizeToCacheInBytes: 3000000,
              disableDevLogs: true,
            },
          }),
        ] : []),
        AutoImport.default({
          ...config.autoImport.config,
          imports: [
            ...config.autoImport.libs,
            'react',
            {
              react: ['cloneElement', 'createContext', 'StrictMode', 'Suspense'],
            },
            {
              'react-hook-form': [
                'useForm',
                'useController',
                'useWatch',
                'useFieldArray',
                'FormProvider',
                'useFormContext',
              ],
            },
            {
              'styled-components': [
                'css',
                'keyframes',
                'createGlobalStyle',
                'ThemeProvider',
                ['default', 'styled'],
              ],
            },
            {
              'react-i18next': [
                'useTranslation',
                'initReactI18next',
                'Trans',
                'Translation',
              ],
            },
            {
              i18next: [
                ['changeLanguage', 'updateLocale'],
                ['default', 'i18nInstance'],
                ['use', 'useI18n'],
              ],
            },
            {
              'react-helmet-async': ['HelmetProvider', 'Helmet'],
            },
            {
              '@tanstack/react-query': [
                'useMutation',
                'useQueries',
                'useQuery',
                'useQueryClient',
                'QueryClient',
                'QueryClientProvider',
                'useInfiniteQuery',
              ],
            },
            {
              'react-router': [
                'createBrowserRouter',
                'RouterProvider',
                'Link',
                'useNavigate',
                'NavLink',
                'useParams',
                'Outlet',
                'useLocation',
                'useSearchParams',
                'useBeforeUnload',
                'useMatch',
                'Navigate',
                'matchRoutes',
              ],
            },
            {
              ahooks: [
                'useToggle',
                'useDebounce',
                'useUpdateEffect',
                'useBoolean',
                'useUnmount',
                'useSessionStorageState',
                'useSetState',
              ],
            },
            {
              from: '@tanstack/react-query',
              imports: [
                'QueryKey',
                'UseQueryOptions',
                'UseQueryResult',
                'QueriesResults',
                'QueriesOptions',
                'UseInfiniteQueryResult',
                'UseInfiniteQueryOptions',
                'QueryObserverResult',
              ],
              type: true,
            },
            {
              from: 'react-hook-form',
              imports: [
                'FieldErrors',
                'Control',
                'RegisterOptions',
                'UseFormGetValues',
                'UseFormReturn',
                'FieldValues',
                'FieldArrayWithId',
                'UseFormSetValue',
                'UseFormSetError',
                'UseFormHandleSubmit',
                'Path',
                'PathValue',
              ],
              type: true,
            },
            {
              zustand: ['create'],
            },
            {
              from: 'zustand',
              imports: ['StoreApi', 'UseBoundStore', 'StateCreator'],
              type: true,
            },
            {
              from: 'react',
              imports: [
                'FunctionComponent',
                'ReactNode',
                'ReactElement',
                'Key',
                ['MouseEvent', 'ReactMouseEvent'],
                ['KeyboardEvent', 'ReactKeyboardEvent'],
                'ComponentType',
                'ComponentProps',
                'ChangeEvent',
                'Ref',
                'RefObject',
                'Dispatch',
                'SetStateAction',
                'CSSProperties',
              ],
              type: true,
            },
            {
              axios: [['default', 'axios']],
            },
            {
              from: 'axios',
              imports: [
                'AxiosInstance',
                'AxiosResponse',
                'AxiosError',
                'InternalAxiosRequestConfig',
                'AxiosRequestConfig',
                'AxiosPromise',
              ],
              type: true,
            },
            {
              dayjs: [['default', 'dayjs']],
            },
            {
              from: 'dayjs',
              imports: [
                'Dayjs',
                'QUnitType',
                'ConfigType',
                'OpUnitType',
                'ManipulateType',
              ],
              type: true,
            },
            {
              from: 'styled-components',
              imports: ['DefaultTheme'],
              type: true,
            },
          ],
        }),
      ],
    };
  });
};

module.exports = createViteConfig;
