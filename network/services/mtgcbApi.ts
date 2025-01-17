import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CardColors, CardRarity, CardSet, CardStatSearch, CardType, SetCategory, SetType } from '../../features/browse/browseSlice';
import { SetSummary } from '../../features/browse/SetBox';
import { Card } from '../../features/browse/types/Card';
import { SetCompletionStatus } from '../../features/collections/collectionSlice';
import buildBrowseFilter, { buildAdditionalWhereFilter } from '../features/browse/buildBrowseFilter';
import buildBrowseExpansionFilter from '../features/browse/buildExpansionBrowseFilter';
import { CardAutocompleteOptions, SearchOptions } from '../features/browse/commonTypes';
import determineDistinctClause from '../features/browse/determineDistinctClause';
import { determineAdditionalSortFilter, determineSortFilter } from '../features/browse/filters';
import {
  allCards,
  allCardsMeta,
  allSetNames,
  allSets,
  allSetsMeta,
  cardAutocomplete,
  collectionByCardIdLegacy,
  collectionSummaryLegacy,
  costToPurchaseAll,
  filteredCardsSummaryLegacy,
  filteredCollectionSummaryLegacy,
  setSummaryLegacy,
  setTypes as setTypesQuery,
  tcgplayerMassImportForUserLegacy,
  updateCollectionLegacy,
} from '../queries/index';

// TODO: Split these up for readability

export const mtgcbApi = createApi({
  reducerPath: 'mtgcb',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_MTGCB_API_URL, credentials: 'include' }),
  tagTypes: ['Sets', 'Cards', 'Collections', 'CollectionSummary'],
  endpoints: (builder) => ({
    getAllSets: builder.query<AxiosResponse<SetResponse>, AllSetsVariables>({
      query: ({ first, skip, name, sortBy = 'releasedAt', sortByDirection = 'DESC', setTypes, setCategories }) => ({
        url: '',
        method: 'POST',
        body: {
          query: allSets,
          variables: {
            first,
            skip,
            sortBy: determineSortFilter(sortBy, sortByDirection),
            name: name ? name.trim() : '',
            where: buildBrowseExpansionFilter({ setTypes, setCategories }),
          },
        },
      }),
    }),
    getAllSetsMeta: builder.query<AxiosResponse<SetsMetaResponse>, AllSetsMetaVariables>({
      query: ({ name, sortBy = 'releasedAt', sortByDirection = 'DESC', setTypes, setCategories }) => ({
        url: '',
        method: 'POST',
        body: {
          query: allSetsMeta,
          variables: {
            sortBy: determineSortFilter(sortBy, sortByDirection),
            name: name ? name.trim() : '',
            where: buildBrowseExpansionFilter({ setTypes, setCategories }),
          },
        },
      }),
    }),
    getFilteredCollectionSummaryLegacy: builder.query<
      AxiosResponse<FilteredCollectionSummaryLegacyResponse>,
      FilteredCollectionSummaryLegacyVariables
    >({
      providesTags: ['CollectionSummary'],
      query: ({
        userId,
        priceType = 'market',
        first = 50,
        skip = 0,
        search = '',
        sortBy = 'releasedAt',
        sortByDirection = 'DESC',
        additionalSortBy,
        whereSetCompletionStatus,
        setTypes,
        setCategories,
      }) => ({
        url: '',
        method: 'POST',
        body: {
          query: filteredCollectionSummaryLegacy,
          variables: {
            userId: Number(userId),
            priceType,
            first,
            skip,
            search,
            sortBy: determineSortFilter(sortBy, sortByDirection),
            additionalSortBy: determineAdditionalSortFilter(sortBy, sortByDirection),
            whereSetCompletionStatus,
            where: buildBrowseExpansionFilter({
              setTypes,
              setCategories,
            }),
          },
        },
      }),
    }),
    getFilteredCardsSummaryLegacy: builder.query<AxiosResponse<FilteredCardsSummaryLegacyResponse>, FilteredCardsSummaryLegacyVariables>({
      providesTags: ['Collections'],
      keepUnusedDataFor: 0,
      query: ({
        userId,
        setId,
        first,
        skip,
        sortBy,
        sortByDirection,
        name,
        oracleTextQuery,
        cardSets,
        cardRarities,
        cardTypes,
        cardColors,
        showAllPrintings,
        cardStatSearches,
        additionalSortBy,
        additionalWhere,
      }) => ({
        url: '',
        method: 'POST',
        body: {
          query: filteredCardsSummaryLegacy,
          variables: {
            userId: Number(userId),
            setId: Number(setId) || null,
            where: buildBrowseFilter({
              cardSets,
              cardRarities,
              cardTypes,
              cardColors,
              oracleTextQuery: oracleTextQuery ? oracleTextQuery.trim() : '',
              cardStatSearches,
            }),
            search: name ? name.trim() : '',
            sortBy: determineSortFilter(sortBy, sortByDirection),
            first,
            skip,
            additionalSortBy: determineAdditionalSortFilter(sortBy, sortByDirection),
            additionalWhere: buildAdditionalWhereFilter({ cardStatSearches }),
          },
        },
      }),
    }),
    getSetBySlug: builder.query<AxiosResponse<SetResponse>, SetBySlugVariables>({
      query: ({ slug }) => ({
        url: '',
        method: 'POST',
        body: {
          query: allSets,
          variables: {
            where: { slug },
          },
        },
      }),
    }),
    getAllSetNames: builder.query<AxiosResponse<SetNamesResponse>, AllSetNamesVariables>({
      query: ({ sortBy = 'releasedAt_DESC' }) => ({
        url: '',
        method: 'POST',
        body: {
          query: allSetNames,
          variables: {
            sortBy,
          },
        },
      }),
    }),
    getSetTypes: builder.query<AxiosResponse<SetTypesResponse>, void>({
      query: () => ({
        url: '',
        method: 'POST',
        body: {
          query: setTypesQuery,
        },
      }),
    }),
    getAllCards: builder.query<AxiosResponse<AllCardsResponse>, SearchOptions>({
      query: ({
        first,
        skip,
        sortBy,
        name,
        oracleTextQuery,
        cardSets,
        cardRarities,
        cardTypes,
        cardColors,
        showAllPrintings,
        cardStatSearches,
        sortByDirection,
      }) => ({
        url: '',
        method: 'POST',
        body: {
          query: allCards,
          variables: {
            first,
            skip,
            sortBy: determineSortFilter(sortBy, sortByDirection),
            name: name ? name.trim() : '',
            where: buildBrowseFilter({
              cardSets,
              cardRarities,
              cardTypes,
              cardColors,
              oracleTextQuery: oracleTextQuery ? oracleTextQuery.trim() : '',
              cardStatSearches,
            }),
            distinct: determineDistinctClause(showAllPrintings, sortBy),
          },
        },
      }),
    }),
    getAllCardsMeta: builder.query<AxiosResponse<AllCardsMetaResponse>, SearchOptions>({
      query: ({
        first,
        skip,
        sortBy,
        name,
        oracleTextQuery,
        cardSets,
        cardRarities,
        cardTypes,
        cardColors,
        showAllPrintings,
        cardStatSearches,
        sortByDirection,
      }) => ({
        url: '',
        method: 'POST',
        body: {
          query: allCardsMeta,
          variables: {
            first,
            skip,
            sortBy: determineSortFilter(sortBy, sortByDirection),
            name: name ? name.trim() : '',
            where: buildBrowseFilter({
              cardSets,
              cardRarities,
              cardTypes,
              cardColors,
              oracleTextQuery: oracleTextQuery ? oracleTextQuery.trim() : '',
              cardStatSearches,
            }),
            distinct: determineDistinctClause(showAllPrintings, sortBy),
          },
        },
      }),
    }),
    getCostToPurchaseAll: builder.query<AxiosResponse<CostToPurchaseAllResponse>, void>({
      query: () => ({
        url: '',
        method: 'POST',
        body: {
          query: costToPurchaseAll,
        },
      }),
    }),
    getCollectionSummaryLegacy: builder.query<AxiosResponse<CollectionSummaryLegacyResponse>, CollectionSummaryLegacyVariables>({
      query: ({ userId }) => ({
        url: '',
        method: 'POST',
        body: {
          query: collectionSummaryLegacy,
          variables: {
            userId: Number(userId),
          },
        },
      }),
      providesTags: ['CollectionSummary'],
    }),
    getTcgplayerMassImportForUserLegacy: builder.query<
      // TODO: Remove me, not a great fit for redux query
      AxiosResponse<TcgplayerMassImportForUserLegacyResponse>,
      TcgplayerMassImportForUserLegacyVariables
    >({
      query: ({ setId, userId }) => ({
        url: '',
        method: 'POST',
        body: {
          query: tcgplayerMassImportForUserLegacy,
          variables: {
            setId: Number(setId),
            userId: Number(userId),
          },
        },
      }),
    }),
    getSetSummaryLegacy: builder.query<AxiosResponse<SetSummaryLegacyResponse>, SetSummaryLegacyVariables>({
      query: ({ setId, userId }) => ({
        url: '',
        method: 'POST',
        body: {
          query: setSummaryLegacy,
          variables: {
            setId: Number(setId),
            userId: Number(userId),
          },
        },
      }),
      providesTags: ['CollectionSummary'],
    }),
    getCollectionByCardIdLegacy: builder.query<AxiosResponse<CollectionByCardIdLegacyResponse>, CollectionByCardIdLegacyVariables>({
      query: ({ cardIds, userId }) => ({
        url: '',
        method: 'POST',
        body: {
          query: collectionByCardIdLegacy,
          variables: {
            cardIds: cardIds.map((cardId) => Number(cardId)),
            userId: Number(userId),
          },
        },
      }),
      providesTags: ['Collections'],
      keepUnusedDataFor: 0,
    }),
    updateCollectionLegacy: builder.mutation<AxiosResponse<UpdateCollectionLegacyResponse>, UpdateCollectionLegacyVariables>({
      query: ({ cardId, mode, quantityRegular, quantityFoil, setId, userId }) => ({
        url: '',
        method: 'POST',
        body: {
          query: updateCollectionLegacy,
          variables: {
            cardId: Number(cardId),
            mode,
            quantityRegular: Number(quantityRegular),
            quantityFoil: Number(quantityFoil),
          },
        },
      }),
      invalidatesTags: ['CollectionSummary'],
    }),
    getCardAutocomplete: builder.query<AxiosResponse<CardAutocompleteResponse>, CardAutocompleteOptions>({
      query: ({ name }) => ({
        url: '',
        method: 'POST',
        body: {
          query: cardAutocomplete,
          variables: {
            name: name ? name.trim() : '',
          },
        },
      }),
    }),
  }),
});

export const {
  useGetAllSetsQuery,
  useGetAllSetsMetaQuery,
  useGetSetBySlugQuery,
  useGetAllSetNamesQuery,
  useGetSetTypesQuery,
  useGetAllCardsQuery,
  useGetAllCardsMetaQuery,
  useGetCostToPurchaseAllQuery,
  useGetCollectionByCardIdLegacyQuery,
  useGetCollectionSummaryLegacyQuery,
  useGetTcgplayerMassImportForUserLegacyQuery,
  useGetSetSummaryLegacyQuery,
  useUpdateCollectionLegacyMutation,
  useGetCardAutocompleteQuery,
  useGetFilteredCollectionSummaryLegacyQuery,
  useGetFilteredCardsSummaryLegacyQuery,
  usePrefetch,
} = mtgcbApi;

// TODO: Code split these types for readability

interface AxiosResponse<T> {
  data: T;
}

interface Set {
  id: string;
  name: string;
  code: string;
  category: string;
  setType: string;
  cardCount: number;
  releasedAt: string;
  sealedProductUrl: string;
  isDraftable: boolean;
  slug: string;
}

interface SetResponse {
  allSets: Set[];
}

interface AllSetsVariables {
  first: number;
  skip: number;
  sortBy?: string;
  name: string;
  sortByDirection: 'ASC' | 'DESC';
  setTypes: SetType[];
  setCategories: SetCategory[];
}

interface SetBySlugVariables {
  slug: string;
}

interface SetsMetaResponse {
  _allSetsMeta: {
    count: number;
  };
}

interface AllSetsMetaVariables {
  sortBy?: string;
  name: string;
  sortByDirection: 'ASC' | 'DESC';
  setTypes: SetType[];
  setCategories: SetCategory[];
}

interface SetName {
  id: string;
  name: string;
}

interface SetNamesResponse {
  allSets: SetName[];
}

interface AllSetNamesVariables {
  sortBy?: string;
}

interface SetTypesResponse {
  setTypes: SetType[];
}

interface AllCardsResponse {
  allCards: Card[];
}

interface AllCardsMetaResponse {
  _allCardsMeta: {
    count: number;
  };
}

interface CostToPurchasePerPrice {
  oneOfEachCard: number;
  oneOfEachMythic: number;
  oneOfEachRare: number;
  oneOfEachUncommon: number;
  oneOfEachCommon: number;
  draftCube: number;
}

interface CostsToPurchaseAll {
  setId: number;
  market: CostToPurchasePerPrice;
  low: CostToPurchasePerPrice;
  average: CostToPurchasePerPrice;
  high: CostToPurchasePerPrice;
}

interface CostToPurchaseAllResponse {
  costToPurchaseAll: {
    costToPurchaseAll: CostsToPurchaseAll[];
  };
}

interface CollectionSummaryLegacyResponse {
  collectionSummaryLegacy: {
    userId: number;
    username: string;
    numberOfCardsInMagic: number;
    totalCardsCollected: number;
    uniquePrintingsCollected: number;
    percentageCollected: number;
    totalValue: number;
    collectionSummary: SetSummary[];
  };
}

interface CollectionSummaryLegacyVariables {
  userId: string;
}

interface TcgplayerMassImportForUserLegacyResponse {
  tcgplayerMassImportForUserLegacy: {
    setId: number;
    tcgplayerMassImport: string;
  };
}

interface TcgplayerMassImportForUserLegacyVariables {
  userId: string;
  setId: string;
}

interface SetSummaryLegacyResponse {
  setSummaryLegacy: {
    setId: number;
    userId: number;
    username: string;
    cardsInSet: number;
    totalCardsCollectedInSet: number;
    uniquePrintingsCollectedInSet: number;
    percentageCollected: number;
    collection: [
      {
        cardID: number;
        quantityReg: number;
        quantityFoil: number;
      }
    ];
    totalValue: {
      market: number;
      low: number;
      average: number;
      high: number;
    };
  };
}

interface SetSummaryLegacyVariables {
  setId: string;
  userId: string;
}

interface CollectionByCardIdLegacyVariables {
  cardIds: number[];
  userId: string;
}

interface CollectionByCardIdLegacyResponse {
  collectionByCardIdLegacy: {
    userId: number;
    collection: [
      {
        cardID: number;
        quantityReg: number;
        quantityFoil: number;
      }
    ];
  };
}

interface UpdateCollectionLegacyVariables {
  cardId: number;
  mode: 'set' | 'increment';
  quantityRegular: number;
  quantityFoil: number;
  setId: string;
  userId: string;
}

interface UpdateCollectionLegacyResponse {
  updateCollectionLegacy: {
    cardId: number;
    quantityRegular: number;
    quantityFoil: number;
  };
}

interface CardAutocompleteResponse {
  allCards: [
    {
      name: string;
      id: number;
      low: number;
      average: number;
      high: number;
      market: number;
      foil: number;
      tcgplayerId: number;
      set: {
        id: string;
        name: string;
        slug: string;
      };
    }
  ];
}

interface CostToCompleteFiltered {
  oneOfEachCard: number;
  oneOfEachMythic: number;
  oneOfEachRare: number;
  oneOfEachUncommon: number;
  oneOfEachCommon: number;
  fourOfEachCard?: number;
  fourOfEachMythic?: number;
  fourOfEachRare?: number;
  fourOfEachUncommon?: number;
  fourOfEachCommon?: number;
  draftCube?: number;
}
interface CollectionSummaryFiltered {
  id: string;
  setId: string;
  totalCardsCollectedInSet: number;
  uniquePrintingsCollectedInSet: number;
  cardsInSet: number;
  percentageCollected: number;
  market: CostToCompleteFiltered;
  low: CostToCompleteFiltered;
  average: CostToCompleteFiltered;
  high: CostToCompleteFiltered;
  name: string;
  slug: string;
  code: string;
  setType: string;
  cardCount: number;
  category: string;
  releasedAt: string;
  sealedProductUrl: string;
  isDraftable: boolean;
}

interface FilteredCollectionSummaryLegacyResponse {
  filteredCollectionSummaryLegacy: {
    userId: number;
    username: string;
    numberOfCardsInMagic: number;
    totalCardsCollected: number;
    uniquePrintingsCollected: number;
    percentageCollected: number;
    totalValue: number;
    collectionSummary: CollectionSummaryFiltered[];
    count: number;
  };
}

interface FilteredCollectionSummaryLegacyVariables {
  userId: string;
  priceType?: 'market' | 'low' | 'average' | 'high' | 'foil';
  first?: number;
  skip?: number;
  search?: string;
  sortBy?: string;
  sortByDirection?: 'ASC' | 'DESC';
  additionalSortBy?:
    | 'currentValue_ASC'
    | 'currentValue_DESC'
    | 'costToComplete_ASC'
    | 'costToComplete_DESC'
    | 'percentageCollected_ASC'
    | 'percentageCollected_DESC';
  whereSetCompletionStatus?: SetCompletionStatus[];
  setTypes: SetType[];
  setCategories: SetCategory[];
}

interface FilteredCardsSummaryLegacyVariables {
  userId: string;
  setId?: string;
  first?: number;
  skip?: number;
  sortBy?: string;
  sortByDirection?: 'ASC' | 'DESC';
  name?: string;
  oracleTextQuery?: string;
  cardTypes?: CardType[];
  cardSets?: CardSet[];
  cardRarities?: CardRarity[];
  cardColors: CardColors;
  showAllPrintings?: boolean;
  cardStatSearches: CardStatSearch[];
  additionalSortBy?:
    | 'currentValue_ASC'
    | 'currentValue_DESC'
    | 'costToComplete_ASC'
    | 'costToComplete_DESC'
    | 'percentageCollected_ASC'
    | 'percentageCollected_DESC';
  additionalWhere: string;
}

interface FilteredCardsSummaryLegacyResponse {
  filteredCardsSummaryLegacy: {
    userId: string;
    cards: {
      id: number;
      name: string;
      set: {
        id: string;
        name: string;
        slug: string;
      };
      rarity: string;
      manaCost: string;
      convertedManaCost: number;
      oracleTypeLine: string;
      collectorNumber: string;
      tcgplayerId: number;
      low: number;
      average: number;
      high: number;
      market: number;
      foil: number;
      quantityReg: number;
      quantityFoil: number;
    }[];
    count: number;
  };
}
