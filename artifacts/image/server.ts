import { getSelectedLanguageModel } from '@/lib/ai/model-selector';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { experimental_generateImage, type ImageModel } from 'ai';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const selectedModel = await getSelectedLanguageModel();
    const model = selectedModel as unknown as ImageModel;

    const { image } = await experimental_generateImage({
      model,
      prompt: title,
      n: 1,
    });

    draftContent = image.base64;

    dataStream.writeData({
      type: 'image-delta',
      content: image.base64,
    });

    return draftContent;
  },
  onUpdateDocument: async ({ description, dataStream }) => {
    let draftContent = '';

    const selectedModel = await getSelectedLanguageModel();
    const model = selectedModel as unknown as ImageModel;

    const { image } = await experimental_generateImage({
      model,
      prompt: description,
      n: 1,
    });

    draftContent = image.base64;

    dataStream.writeData({
      type: 'image-delta',
      content: image.base64,
    });

    return draftContent;
  },
});
