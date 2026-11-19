import { Custom404 } from "components/404/404";
import { Layout } from "components/layout/Layout";
import { Seo } from "components/Seo";

const Page404 = () => {
  return (
    <Layout>
      <Seo title="Page not found" description="This page does not exist." withoutSiteGraph />
      <Custom404 />
    </Layout>
  );
};

export default Page404;
