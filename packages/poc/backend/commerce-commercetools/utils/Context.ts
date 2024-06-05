import { Context } from '@frontastic/extension-types';

/**
 * Use this object to override values locally that would normally
 * be fetched from the projectConfiguration.
 * Only works in development.
 */
const projectConfigurationOverrides: Record<string, string | number> = {
    EXTENSION_COMMERCETOOLS_AUTH_URL: process.env.EXTENSION_COMMERCETOOLS_AUTH_URL,
    EXTENSION_COMMERCETOOLS_CLIENT_ID: process.env.EXTENSION_COMMERCETOOLS_CLIENT_ID,
    EXTENSION_COMMERCETOOLS_CLIENT_SECRET: process.env.EXTENSION_COMMERCETOOLS_CLIENT_SECRET,
    EXTENSION_COMMERCETOOLS_HOST_URL: process.env.EXTENSION_COMMERCETOOLS_HOST_URL,
    EXTENSION_COMMERCETOOLS_PROJECT_KEY: process.env.EXTENSION_COMMERCETOOLS_PROJECT_KEY
};

const isDevEnv = (context: Context) => {
    return context.environment === 'development' || context.environment === 'dev';
};

export const getFromProjectConfig = (key: string, context: Context) => {
    if (isDevEnv(context) && projectConfigurationOverrides[key]) {
        return projectConfigurationOverrides[key];
    }

    return context.projectConfiguration[key];
};
