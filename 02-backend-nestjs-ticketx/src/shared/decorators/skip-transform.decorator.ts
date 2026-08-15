import { SetMetadata } from '@nestjs/common';

export const SKIP_TRANSFORM_KEY = 'skipTransform';

/**
 * Marks a route as exempt from `TransformInterceptor`'s `{success,data}` envelope —
 * for endpoints whose response shape is dictated by an external contract (e.g. a
 * payment gateway's webhook ack format), per `API_SPEC.md` §7.
 */
export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true);
