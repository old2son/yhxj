type TabItem = {
    key: "home" | "explore" | "game";
    text: string;
    pagePath: string;
};

const tabItems: TabItem[] = [
    {
        key: "home",
        text: "星空首页",
        pagePath: "/pages/index/index",
    },
    {
        key: "explore",
        text: "宇宙探索",
        pagePath: "/pages/explore/index",
    },
    {
        key: "game",
        text: "拦截游戏",
        pagePath: "/pages/game/index",
    },
];

Component({
    data: {
        selectedPath: "/pages/index/index",
        tabItems,
    },

    methods: {
        setActive(pagePath: string) {
            this.setData({
                selectedPath: pagePath,
            });
        },

        switchTab(event: WechatMiniprogram.BaseEvent) {
            const { path } = event.currentTarget.dataset as { path: string };
            if (!path || path === this.data.selectedPath) {
                return;
            }

            wx.switchTab({
                url: path,
            });
        },
    },
});
