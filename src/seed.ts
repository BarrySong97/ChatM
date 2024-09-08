import { BookService } from "./api/services/BookService";
import { ProviderService } from "./api/services/ProviderService";
import { ModelService } from "./api/services/ModelService";
import { DEFAULT_MODEL_PROVIDER_LIST } from "./lib/agent-runtime/modelProviders";

export async function seed() {
  // Seed default book if not exists
  const books = await BookService.listBooks();
  if (!books.length) {
    await BookService.createBook({
      name: "默认账本",
      isDefault: 1,
      isCurrent: 1,
    });
  }

  // Seed providers and models if not exists
  const providers = await ProviderService.listProviders();
  if (!providers.length) {
    for (const providerData of DEFAULT_MODEL_PROVIDER_LIST) {
      const provider = await ProviderService.createProvider({
        name: providerData.name,
        baseUrl: providerData.baseURL || "", // Set default base URL
        defaultModel: providerData.defaultModel || "", // Set default model
        // Note: We're not setting apiKey here as it should be set by the user
      });

      for (const modelData of providerData.chatModels) {
        await ModelService.createModel({
          name: modelData.displayName || modelData.id,
          providerId: provider.id,
        });
      }
    }
  }
}
