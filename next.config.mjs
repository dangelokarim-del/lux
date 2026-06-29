/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @splinetool/react-spline ships ESM-only with an `import`-only exports map;
  // transpiling it + asserting the `import` condition lets webpack resolve it.
  transpilePackages: ["@splinetool/react-spline", "@splinetool/runtime"],
  webpack: (config) => {
    config.resolve.conditionNames = Array.from(
      new Set(["import", "require", "node", "default", ...(config.resolve.conditionNames ?? [])])
    );
    return config;
  },
};

export default nextConfig;
