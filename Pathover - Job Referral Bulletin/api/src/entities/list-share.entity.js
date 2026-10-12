class ListShare {
    constructor(data = {}) {
        this.id = data.id;
        this.list_id = data.list_id;
        this.shared_by_user_id = data.shared_by_user_id;
        this.shared_with_user_id = data.shared_with_user_id;
        this.created_at = data.created_at;
    }

    static tableName = 'list_shares';
}

export default ListShare; 