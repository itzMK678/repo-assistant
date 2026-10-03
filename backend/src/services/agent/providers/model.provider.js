export class ModelProvider {
    async generate() {
        throw new Error(
            "ModelProvider.generate() must be implemented"
        );
    }
}
