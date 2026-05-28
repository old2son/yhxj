type QuoteItem = {
    text: string;
    author: string;
};

const quotes: QuoteItem[] = [
    {
        text: "星空最美妙的地方，在于所有的尘埃最终都会重新组合，诞生出无限奇迹。",
        author: "卡尔·萨根《宇宙》",
    },
    {
        text: "我们也是尘埃的一部分。当仰望星空时，你实际上是宇宙在审视自身。",
        author: "艾伦·沃茨《感知世界》",
    },
    {
        text: "探索宇宙是人类写给未知的一封不寄回信的情书。",
        author: "《深空漫游》编导",
    },
    {
        text: "在这个微小的淡蓝色圆点上，有你爱的每一个人，你听说过的每一个人。",
        author: "卡尔·萨根",
    },
];

Page({
    data: {
        progress: 64.8,
        quoteIndex: 0,
        currentQuote: quotes[0],
        funFactTitle: "银河系里有多少颗恒星？",
        funFactBrief: "约1000亿至4000亿颗",
        showFactModal: false,
        loadingVisible: true,
        loadingPercent: 0,
        loadingTip: "正在链接太空港口...",
    },

    loadingTimer: 0 as number | undefined,

    onLoad() {
        this.runLoadingAnimation();
    },

    onShow() {
        const tabBar = typeof this.getTabBar === "function" ? this.getTabBar() : null;
        if (tabBar && typeof (tabBar as any).setActive === "function") {
            (tabBar as any).setActive("/pages/index/index");
        }
    },

    onUnload() {
        if (this.loadingTimer) {
            clearInterval(this.loadingTimer);
        }
    },

    runLoadingAnimation() {
        const tips = [
            "正在加载星际引擎...",
            "连接太空港口信息...",
            "装载UFO导览模块...",
            "渲染银河星图...",
            "正在降落主甲板...",
        ];

        let percent = 0;

        this.loadingTimer = setInterval(() => {
            percent += Math.floor(Math.random() * 10) + 6;

            if (percent >= 100) {
                percent = 100;
            }

            const tipIndex = Math.min(
                tips.length - 1,
                Math.floor(percent / 20),
            );

            this.setData({
                loadingPercent: percent,
                loadingTip: tips[tipIndex],
            });

            if (percent >= 100) {
                if (this.loadingTimer) {
                    clearInterval(this.loadingTimer);
                }

                setTimeout(() => {
                    this.setData({
                        loadingVisible: false,
                    });
                }, 260);
            }
        }, 90);
    },

    nextQuote() {
        const currentIndex = this.data.quoteIndex;
        let nextIndex = currentIndex;

        while (nextIndex === currentIndex) {
            nextIndex = Math.floor(Math.random() * quotes.length);
        }

        this.setData({
            quoteIndex: nextIndex,
            currentQuote: quotes[nextIndex],
        });
    },

    goExplore() {
        wx.switchTab({
            url: "/pages/explore/index",
        });
    },

    goGame() {
        wx.switchTab({
            url: "/pages/game/index",
        });
    },

    handleFeatureTap(event: WechatMiniprogram.BaseEvent) {
        const { name } = event.currentTarget.dataset;
        wx.showToast({
            title: `${name}开发中`,
            icon: "none",
        });
    },

    openFactModal() {
        this.setData({
            showFactModal: true,
        });
    },

    closeFactModal() {
        this.setData({
            showFactModal: false,
        });
    },

    noop() {},
});
