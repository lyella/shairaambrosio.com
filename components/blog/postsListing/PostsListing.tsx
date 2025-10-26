import algoliasearch from "algoliasearch";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useState } from "react";
import type { HitsProvided } from "react-instantsearch-core";
import { Configure, connectHits, connectStateResults, InstantSearch } from "react-instantsearch-dom";
import ReactPaginate from "react-paginate";

const Lottie = dynamic(() => import("react-lottie"), { ssr: false });

import { PopularPosts } from "components/blog/popularPosts/PopularPosts";
import { PostThumbnail } from "components/blog/postsListing/postThumbnail/PostThumbnail";
import { CategoriesList } from "components/category/categoriesList/CategoriesList";
import { LoaderRing } from "components/common/loader/LoaderRing";
import { SearchBox } from "components/common/searchBox/SearchBox";
import { allCategories } from "data/categories";
import type { Category, Post } from "types";

import thinking from "../../../public/lottie/thinking.json";

import styles from "./postsListing.module.scss";

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

interface CustomHitsProps extends HitsProvided<Post> {
  readonly currentObjectID: string | null;
  readonly setObjectId: (objectId: string) => void;
}

export const CustomHits = connectHits<CustomHitsProps, Post>(({ hits, currentObjectID }) => {
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
            <PostThumbnail post={hit} />
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

interface PostsListingProps {
  readonly popularPosts: Post[];
  readonly categories: Category[];
}

const LoadingIndicator = connectStateResults(({ isSearchStalled }) =>
  isSearchStalled ? (
    <div className={styles.loading}>
      <LoaderRing />
    </div>
  ) : null,
);

export const PostsListing = memo<PostsListingProps>(({ popularPosts, categories }) => {
  const [currentObjectID, setObjectId] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = useCallback(() => {
    setTimeout(() => setObjectId(null), 0);
  }, []);

  return (
    <div className={styles.posts}>
      <CategoriesList categories={categories} />
      <InstantSearch indexName="posts" searchClient={searchClient}>
        <div className={styles.main}>
          <PopularPosts posts={popularPosts} />
          <div className={styles.wrapper}>
            {router.query.category ? (
              <>
                <h2 className={styles.searchedCategory}>
                  {allCategories.find((c) => c.slug === router.query.category)?.name}
                </h2>
                <Configure filters={`category:${router.query.category}`} />
              </>
            ) : (
              <SearchBox currentObjectID={currentObjectID} onChange={handleInputChange} />
            )}
            <LoadingIndicator />
            <CustomHits currentObjectID={currentObjectID} setObjectId={setObjectId} />
          </div>
        </div>
      </InstantSearch>
    </div>
  );
});

PostsListing.displayName = "PostsListing";
