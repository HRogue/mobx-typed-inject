import React, { createContext, FunctionComponent, useContext } from "react";
import { observer } from "mobx-react";
import { IReactComponent } from "mobx-react/dist/types/IReactComponent";


type PropsNStore<Props, Store> = Props & { store: Store };

export function wrapInject<ContainerProps, Store, ComponentProps extends ContainerProps>(
    Component: IReactComponent<ComponentProps>,
    grabStoreFn: (store: Store, ownProps?: ContainerProps) => ComponentProps
) {

    const Context = createContext<Store | null>(null);
    const useStore = () => {
        const store = useContext(Context);
        if (!store) {
            throw new Error("Cannot get store from context");
        }

        return store;
    };

    const Provider = Context.Provider;

    const Injector: FunctionComponent<ContainerProps> = (props) => {
        const copyContainerProps = { ...props }
        const store = useStore();
        const cmpProps = grabStoreFn(store, copyContainerProps)

        return React.createElement(Component, cmpProps)
    }

    const ObservedInjector = observer(Injector);

    const WrappedComponent: FunctionComponent<PropsNStore<ContainerProps, Store>> = (
        props
    ) => {
        const ownProps = { ...props };
        delete ownProps.store;

        return (
            <Provider value={props.store} >
                <ObservedInjector {...ownProps} />
            </Provider>
        );
    };

    return WrappedComponent;
}