import type { NextPage } from "next";

import { Contact } from "components/contact/Contact";
import { Layout } from "components/layout/Layout";
import { Seo } from "components/Seo";
import { Hero } from "components/common/hero/Hero";

const About: NextPage = () => {
  const description = "Would you like to work together? Do you have a request? Or do you simply want to converse? Please inform me.";

  return (
    <Layout>
      <Seo title="Contact" description={description} imageUrl={"/img/contact.png"} />
      <Hero title="Contact" description={description} />
      <Contact />
    </Layout>
  );
};

export default About;
