<script>
export default {
    data() {
        return {
            urlList: [],
            urlChunks: [],
            currentSkillList: [],
            offset: 0,
            currentChooseChunk: null,
            currentChunkIndex: null,
            message: '',
            defaultIcon:
                'data:image/png;base64,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',
            randomNum: 0,
            numberOfSkillHaveIcon: 0,
            numberOfSkill: 0
        };
    },
    async created() {
        await this.getURLlist();
        this.splitToChunk();
        console.log(this.urlChunks);
        this.randomNum = Math.random();
        this.numberOfSkill = this.urlList.length - 1;
        for (let index = 0; index < this.urlList.length; index++) {
            const element = this.urlList[index];
            if (element.icon !== this.defaultIcon) {
                this.numberOfSkillHaveIcon = this.numberOfSkillHaveIcon + 1;
            }
        }
    },
    methods: {
        async getURLlist() {
            const res = await fetch('/skills/url-list');
            const resData = await res.json();
            this.urlList = resData;
        },
        splitToChunk() {
            const chunkSize = 5;
            for (let i = 0; i < this.urlList.length; i += chunkSize) {
                const chunk = this.urlList.slice(i, i + chunkSize);
                // do whatever
                this.urlChunks.push(chunk);
            }
        },
        generateImageForChunk(chunk) {
            let promises = [];
            chunk.forEach((skill) => {
                if (skill.url) {
                    promises.push(this.generateIconForSkill(skill));
                }
            });
            Promise.all(promises).then(() => {
                console.log('done');
            });
        },
        async generateIconForSkill(skill) {
            console.log('Url');
            console.log(skill.url);
            const fetchOption = {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: skill.name,
                    url: skill.url
                })
            };

            const res = await fetch('/skills/generate-skill-icon', fetchOption);
            const resData = await res.json();
            console.log(resData);
            this.message = resData.mess;
        },
        confirmChooseChunk(chunkIndex) {
            this.randomNum = Math.random();
            this.currentChunkIndex = chunkIndex;
            this.currentChooseChunk = this.urlChunks[chunkIndex];
        }
    }
};
</script>

<template>
    <div class="container">
        <h1 class="tile">Generate Image And Add to AWS</h1>
        <h3>{{ message }}</h3>
        <div class="d-flex flex-row-reverse">
            <button
                type="button"
                @click="generateImageForChunk(currentChooseChunk)"
            >
                Generate choose batch
            </button>
            <div class="me-4">
                <h5>
                    Progress: {{ numberOfSkillHaveIcon }} / {{ numberOfSkill }}
                </h5>
            </div>
        </div>
        <hr />
        <div class="d-flex flex-row gap-3 w-100 flex-wrap">
            <button
                class="chunk-btn"
                :class="{
                    'chunk-focus': index === currentChunkIndex,
                    'chunk-complete': chunk[0].icon !== defaultIcon
                }"
                type="button"
                v-for="(chunk, index) in urlChunks"
                @click="confirmChooseChunk(index)"
            >
                chunk of skill "{{ chunk[0].name }}" to skill "{{
                    chunk[chunk.length - 1].name
                }}"
            </button>
        </div>
        <hr />
        <h2>Icon Gallery</h2>
        <div class="d-flex flex-row gap-3 w-100 flex-wrap">
            <div v-for="skill in currentChooseChunk" class="w-30">
                <div class="d-flex flex-column icon-div">
                    <h6 class="">{{ skill.name }}</h6>
                    <img
                        width="400"
                        height="400"
                        :src="`https://institute-skill-icons.s3.us-east-1.amazonaws.com/${skill.url}?${randomNum}`"
                    />
                    <!-- <img width="400" height="400" :src="skill.icon" /> -->
                </div>
            </div>
        </div>
        <hr />
        <!-- <div v-for="url in urlList">{{ url.name }}</div> -->
    </div>
</template>

<style>
.chunk-btn {
    background-color: aliceblue;
    border: 1px solid plum;
    border-radius: 12px;
    padding: 5px 10px;
}

.chunk-focus {
    background-color: blueviolet;
    border: 3px solid red;
}

.chunk-complete {
    background-color: greenyellow;
}

.icon-div {
    border-radius: 5px;
    border: 2px solid blueviolet;
    padding: 5px;
}
</style>
