import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    esmExternals: false,
  },
  webpack: (config, { isServer }) => {
    // Exclure les modules MediaPipe du build serveur
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@mediapipe/face_mesh': '@mediapipe/face_mesh',
        '@mediapipe/camera_utils': '@mediapipe/camera_utils',
        '@mediapipe/drawing_utils': '@mediapipe/drawing_utils',
        '@tensorflow/tfjs': '@tensorflow/tfjs',
        '@tensorflow/tfjs-node': '@tensorflow/tfjs-node'
      });
    }
    
    // Optimisations pour le build
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    
    return config;
  },
  transpilePackages: ['@mediapipe/face_mesh', '@mediapipe/camera_utils', '@mediapipe/drawing_utils'],
  images: {
    unoptimized: true,
  },
  output: 'standalone',
};

export default nextConfig;
