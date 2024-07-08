import { Any, ArrayContainedBy, ArrayContains, ArrayOverlap, Between, Equal, ILike, In, IsNull, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not } from 'typeorm';


export const FILTER_MAPPER = {
    not: Not,
    lesss_than: LessThan,
    less_than_or_equal: LessThanOrEqual,
    more_than: MoreThan,
    more_than_or_equal: MoreThanOrEqual,
    equal: Equal,
    between: Between,
    in: In,
    is_null: IsNull,
    like: Like,
    i_like: ILike,
    any: Any,
    array_contains: ArrayContains,
    array_contained_by: ArrayContainedBy,
    array_overlap: ArrayOverlap
};