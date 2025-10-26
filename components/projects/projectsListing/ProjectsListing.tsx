import algoliasearch from "algoliasearch";
import dynamic from "next/dynamic";
import { memo, useCallback, useEffect, useState } from "react";
import type { HitsProvided } from "react-instantsearch-core";
import { connectHits, connectStateResults, InstantSearch } from "react-instantsearch-dom";
import ReactPaginate from "react-paginate";

const Lottie = dynamic(() => import("react-lottie").then((mod) => mod.default), { ssr: false });

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

interface CustomHitsProps extends HitsProvided<Project> {
  readonly currentObjectID: string | null;
  readonly setObjectId: (objectId: string) => void;
  readonly blurImageData: {
    readonly slug: string;
    readonly base64: string;
  }[];
}

export const CustomHits = connectHits<CustomHitsProps, Project>(({ hits, currentObjectID, blurImageData }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!hits.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.avatar}>
          {isMounted && <Lottie options={searchThinking} height={300} />}
        </div>
      </div>
    );
  }

  const [currentPage, setCurrentPage] = useState(0);
  const HITS_PER_PAGE = 10;

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };

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
});

const LoadingIndicator = connectStateResults(({ isSearchStalled }) =>
  isSearchStalled ? (
    <div className={styles.loading}>
      <LoaderRing />
    </div>
  ) : null,
);

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
        <CustomHits currentObjectID={currentObjectID} setObjectId={setObjectId} blurImageData={blurImageData} />
      </InstantSearch>
    </div>
  );
});

ProjectsListing.displayName = "ProjectsListing";
