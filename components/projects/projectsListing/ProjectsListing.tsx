import algoliasearch from "algoliasearch";

import dynamic from "next/dynamic";

import { memo, useCallback, useEffect, useState } from "react";

import { InstantSearch, useHits, useInstantSearch } from "react-instantsearch";

type AlgoliaHit = { objectID: string };

import ReactPaginate from "react-paginate";

const Lottie = dynamic(() => import("react-lottie"), { ssr: false });

import { LoaderRing } from "components/common/loader/LoaderRing";

import { SearchBox } from "components/common/searchBox/SearchBox";

import { ProjectThumbnail } from "components/projects/projectsListing/projectThumbnail/ProjectThumbnail";

import type { Project } from "types";

import thinking from "../../../public/lottie/thinking.json";

import styles from "./projectsListing.module.scss";

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!,
);

const searchThinking = {
  loop: true,
  autoplay: true,
  animationData: thinking,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

interface CustomHitsProps {
  readonly currentObjectID: string | null;
  readonly blurImageData: {
    readonly slug: string;
    readonly base64: string;
  }[];
}

export const CustomHits = ({ currentObjectID, blurImageData }: CustomHitsProps) => {
  const { hits } = useHits<AlgoliaHit & Project>();

  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const HITS_PER_PAGE = 10;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };

  if (!hits.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.avatar}>
          {isMounted && <Lottie options={searchThinking} height={300} />}
        </div>
      </div>
    );
  }

  const startIndex = currentPage * HITS_PER_PAGE;
  const endIndex = startIndex + HITS_PER_PAGE;
  const currentHits = hits.slice(startIndex, endIndex);

  return (
    <>
      <ol id="search-hits-list" className={styles.list}>
        {currentHits.map((hit) => (
          <li
            key={hit.objectID}
            role="option"
            aria-describedby="search-details"
            aria-selected={currentObjectID === hit.objectID ? "true" : "false"}
            id={"id" + hit.objectID}
            className={styles.hit}
          >
            <ProjectThumbnail project={hit} blurDataURL={blurImageData.find((d) => d.slug === hit.slug)?.base64} />
          </li>
        ))}
      </ol>
      <ReactPaginate
        pageCount={Math.ceil(hits.length / HITS_PER_PAGE)}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageChange}
        containerClassName={styles.pagination}
        activeClassName={styles.active}
      />
    </>
  );
};

const LoadingIndicator = () => {
  const { status } = useInstantSearch();

  return status === "stalled" ? (
    <div className={styles.loading}>
      <LoaderRing />
    </div>
  ) : null;
};

interface ProjectsListingProps {
  readonly blurImageData: {
    readonly slug: string;
    readonly base64: string;
  }[];
}

export const ProjectsListing = memo<ProjectsListingProps>(({ blurImageData }) => {
  const [currentObjectID, setObjectId] = useState<string | null>(null);

  const handleInputChange = useCallback(() => {
    setTimeout(() => setObjectId(null), 0);
  }, []);

  return (
    <div className={styles.projects}>
      <InstantSearch indexName="projects" searchClient={searchClient}>
        <SearchBox currentObjectID={currentObjectID} onChange={handleInputChange} />
        <LoadingIndicator />
        <CustomHits currentObjectID={currentObjectID} blurImageData={blurImageData} />
      </InstantSearch>
    </div>
  );
});

ProjectsListing.displayName = "ProjectsListing";
