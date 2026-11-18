import type { NextPage, GetStaticProps } from "next";

import { Layout } from "components/layout/Layout";
import { Seo } from "components/Seo";
import { Hero } from "components/common/hero/Hero";
import { AboutView } from "components/about/AboutView";

const About: NextPage = () => {
  const description = "Curious about the mastermind behind the screen? Your answers await!";

  return (
    <Layout>
      <Seo title="About" description={description} imageUrl={"/img/about.png"} />
      <Hero title="About" description={description} />
      <AboutView />
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  return { props: {}, revalidate: 10 };
};

export default About;
