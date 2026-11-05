const Honeypot = () =>
{
    return (
        <div aria-hidden="true" style={{position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden'}}>
            <label htmlFor="website">No llenar este campo</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
    );
};

export default Honeypot;
