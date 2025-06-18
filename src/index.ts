import { basekit, FieldType, field, FieldComponent, FieldCode, NumberFormatter, AuthorizationType } from '@lark-opdev/block-basekit-server-api';
const { t } = field;

basekit.addDomainList([
  "xhscdn.com",
]);

basekit.addField({
  formItems: [
    {
      key: 'url',
      label: '请输入需要转附件的URL',
      component: FieldComponent.FieldSelect,
      props: {
        supportType: [FieldType.Url]
      },
      validator: {
        required: true,
      }
    },
  ],
  resultType: {
    type: FieldType.Attachment,
  },
  // formItemParams 为运行时传入的字段参数，对应字段配置里的 formItems （如引用的依赖字段）
  execute: async (formItemParams, context) => {
    /** 为方便查看日志，使用此方法替代console.log */
    function debugLog(arg: any) {
      // @ts-ignore
      console.log(JSON.stringify({
        formItemParams,
        context,
        arg
      }))
    }

    try {
      const { url } = formItemParams;
      if (Array.isArray(url)) {

        const itms = [];

        for (const u of url) {
          const link = u.link;
          if (link) {
            const resp = await context.fetch(link, {
              method: 'HEAD',
            });

            if (resp.ok) {

              const contentType = resp.headers.get('Content-Type');

              // 检查是否为图片类型
              if (contentType && contentType.startsWith('image/')) {
                  const imageType = contentType.split('/')[1]; // 例如：'jpeg', 'png'
                  const timestamp = Date.now();
                  const randomString = Math.random().toString(36).substring(2, 8); // 生成一个短的随机字符串
                  const fileName = `${timestamp}_${randomString}.${imageType}`; // 结合时间戳、随机字符串和后缀名

                  itms.push({
                      name: fileName,
                      content: link,
                      contentType: "attachment/url",
                  });

              } else {
                  // 如果不是图片，可以根据需求进行不同的处理，或者跳过
                  debugLog({"===11353===": `URL ${link} did not return an image. Content-Type: ${contentType}`});
              }

            }

          }
        }

        if (itms.length > 0) {
          debugLog({
            '===2 itms': itms
          });
          return {
            code: FieldCode.Success, // 0 表示请求成功
            // data 类型需与下方 resultType 定义一致
            data: itms,
          }
        }

        return undefined;
      }

      // 请避免使用 debugLog(url) 这类方式输出日志，因为所查到的日志是没有顺序的，为方便排查错误，对每个log进行手动标记顺序
      debugLog({
        '===1 url为空': url
      });
      return {
        code: FieldCode.Error,
      };
    } catch (error) {
      debugLog({
        '===999 未知错误': String(error)
      });
      return {
        code: FieldCode.Error,
      };
    }

  },
});
export default basekit;